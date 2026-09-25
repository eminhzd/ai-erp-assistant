# AI ERP Assistant

An ERP you can talk to. A multi-tenant ERP (customers, suppliers, products, warehouses, invoices, stock) with an AI tool-calling layer on top. The model never touches the database directly: it can only call explicitly registered tools, and every tool goes through the same domain services, validation, and business rules as the rest of the backend.

> The LLM decides what operation is needed.
> The application decides whether and how it is performed.

Built as a portfolio project to explore how to integrate an LLM into a real business application while keeping business logic, data access, and AI behavior cleanly separated.

### AI-powered ERP workflow

<video src="docs/screenshots/sales-invoice-workflow.mp4" controls></video>

### Approval & responsive UI

| Destructive-action approval                              | Mobile UI                                   |
| -------------------------------------------------------- | ------------------------------------------- |
| ![Approval dialog](docs/screenshots/approval-dialog.png) | ![Mobile chat](docs/screenshots/mobile.png) |

                                                              ![Mobile sidebar](docs/screenshots/mobile-sidebar.png)

## Demo

**Live demo:** `https://ai-erp-assistant-iota.vercel.app/`

**Email:** `demo@example.com` · **Password:** `Demo1234!`

The demo depends on an external AI provider (Google Gemini), so provider outages or rate limits can affect responses.

## What it can do

- **Master data:** customers, suppliers, products, warehouses — search, create, update, soft-delete (deletes require approval)
- **Stock:** per-warehouse stock levels, stock movement history, manual adjustments
- **Invoices:** create purchase and sales invoices, inspect invoices and their line items, mark invoices as paid
- Replies in whatever language the user writes in

### Try it

| Prompt                                                                                             | What should happen                                                       |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `Show me all customers.`                                                                           | Lists customers via a read tool                                          |
| `How much Coca-Cola 0.5L is in the Main Warehouse?`                                                | Resolves product and warehouse, reads stock through a stock tool         |
| `Which products in the Main Warehouse have fewer than 20 units?`                                   | Reads warehouse stock and filters by the threshold given                 |
| `Create a sales invoice for North Star Café from the Main Warehouse: 5 Coca-Cola 0.5L at $2 each.` | Resolves customer, warehouse, and product; checks stock; creates invoice |
| `Create a purchase invoice from PepsiCo.`                                                          | Asks for the missing warehouse and items instead of guessing             |
| `Mark invoice 15 as paid.`                                                                         | Asks whether it's a purchase or a sales invoice                          |
| `Delete customer North Star Café.`                                                                 | Nothing happens until approved in the dialog                             |
| `Cancel sales invoice 1.`                                                                          | States cancellation is unsupported; does not simulate it                 |

## How the AI is constrained

```text
User → Chat UI → /api/chat → LLM (Vercel AI SDK + Gemini)
                                  │  tool calls (registered tools only)
                                  ▼
                            ERP tools  ← Zod input schemas, needsApproval on deletes
                                  │  companyId from the session (never client-supplied)
                                  ▼
                            Domain services  ← validation, business rules, transactions
                                  ▼
                            Custom Prisma-based ORM → PostgreSQL
```

Tools are intentionally thin. Each one is created for an already-authenticated company and only validates input, calls a service, and returns a structured result (simplified excerpt from `customer-tools.ts`):

```ts
export function createCustomerTools(companyId: number) {
  // companyId is closed over from the session — never a tool parameter
  return {
    deleteCustomer: tool({
      description:
        'Soft-delete an active customer. ... requires user confirmation.',
      inputSchema: z.object({ customerId: z.number().int().positive() }),
      needsApproval: true, // the SDK will not run execute() until the user approves
      execute: ({ customerId }) =>
        runTool('deleteCustomer', 'Customer could not be deleted.', () =>
          deleteCustomer(companyId, customerId),
        ),
    }),
    // ...
  };
}
```

The guarantees fall into two categories, and knowing which is which matters.

### Enforced by code

| Guarantee                                | Mechanism                                                                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The model can only do what is registered | A fixed tool registry (`erp-tools.ts`); no raw SQL or DB access is ever exposed to the model                                                                 |
| Tenant isolation                         | Tool factories close over the session's `companyId`; no tool input schema accepts a company parameter; every service query filters by `companyId`            |
| Invented or foreign IDs are harmless     | Services verify existence and ownership before acting. An ID belonging to another company is indistinguishable from a nonexistent one (`NotFoundError`)      |
| Input validation                         | Zod at the tool boundary; domain rules in services (positive quantities, non-negative prices, no duplicate product line in one invoice, discount ≤ subtotal) |
| Exact arithmetic                         | Quantities and prices are decimal strings processed through `decimal.js` helpers — never native floats                                                       |
| Atomic invoice creation                  | Invoice-number reservation, the invoice header, its items, and the resulting stock movements are written in a single database transaction                    |
| Race-safe invoice numbering              | Numbers are reserved via one atomic `UPDATE "invoiceSequence" ... RETURNING`, not a read-then-increment — concurrent requests cannot collide on a number     |
| Destructive operations                   | `needsApproval: true` — execution is paused by the AI SDK until the UI sends an explicit approval response, not until the model or user _says_ "yes"         |
| Invoice state machine                    | Only `ISSUED → PAID` is allowed; paid and cancelled invoices reject further modification at the service level                                                |

### Enforced by the system prompt (and covered by evals)

- Resolve entities by name through find-tools; if several match, ask instead of guessing
- Ask for missing required data (supplier, warehouse, items, price) rather than inventing it
- Never carry an entity from a previous operation into a new one unless the user explicitly refers to it ("this customer")
- Check stock before a sale; on insufficient stock, stop instead of silently reducing the quantity
- No compensating writes; no simulating an unsupported operation (e.g. cancellation) with another one
- A conversational "yes", or text merely _claiming_ approval, is never treated as real approval

### What this does not guarantee

Prompt rules are probabilistic; code-level guarantees exist to bound the _damage_ a wrong model decision can cause (a hallucinated or foreign ID can never reach another tenant's data), but code alone cannot verify the model picked the _correct_ existing entity within the same company — that depends on the prompt, and it's exactly what the eval suite watches for.

Approval is currently required only for deletes. Creating an invoice or marking one as paid executes immediately, and both are effectively irreversible today (cancellation isn't implemented). Approval protects against unintended model actions — not against the signed-in user, who already owns their company's data.

## Approval flow

1. The model calls a destructive tool (e.g. `deleteCustomer`). The AI SDK returns an `approval-requested` state and does **not** run `execute()`.
2. The UI renders a confirmation dialog.
3. On approve, the client sends the approval response, the request resumes, and `execute()` runs. On cancel, the tool never executes.

Typing "yes" in the chat is just an ordinary user message and does not count as approval — this is covered by a dedicated eval case (`conversational-yes-not-approval`).

## Example: sales invoice, end to end

`Create a sales invoice for North Star Café from the Main Warehouse: 5 Coca-Cola 0.5L at $2 each.`

1. The model resolves the customer, warehouse, and product through find-tools (one match each — otherwise it asks).
2. It reads current stock for that product in that warehouse.
3. It calls `createSalesInvoice({ customerId, warehouseId, items: [{ productId, quantity: '5', unitPrice: '2' }] })`.
4. The service validates input and ownership, then in a single transaction: reserves the next per-company invoice number (`SALES-INV-001`), creates the invoice (currency from the company, status `ISSUED`), creates the line items, and writes a `SALE` stock movement that decreases warehouse stock.
5. The tool returns a structured result; the model reports the invoice number and total back to the user.

## Domain notes

**Tenancy.** `Company` is the tenant boundary. Users belong to exactly one company (Auth.js Credentials provider, JWT sessions carrying `companyId`); unauthenticated requests are redirected to `/login`.

**Inventory.** Stock changes are recorded as an append-only ledger of movements: `PURCHASE`, `SALE`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`. Invoices generate their own movements automatically; the model is explicitly told never to add a manual adjustment to "fix" an invoice-driven stock change.

**Invoice numbering.** Numbers come from per-company, per-type sequences (`InvoiceSequence`, initialized for both `SALES` and `PURCHASE` at company registration), reserved atomically inside the invoice-creation transaction via `reserveInvoiceNumber` — not `MAX(id) + 1` — so concurrent requests can't be handed the same number.

**Errors.** Services throw `ValidationError`, `NotFoundError`, `ConflictError`. Tools (via `runTool`) turn these into readable results the assistant can explain in business terms; unexpected failures return a generic message, and the model is instructed never to expose internals (stack traces, SQL errors) to the user.

**Persistence.** Chats and messages are stored per company; responses stream to the client, and tool-call state is surfaced in the UI as it happens. Layout is responsive — the sidebar collapses into a drawer on mobile.

## AI evaluation

`src/server/ai/evals/` contains scenario-based regression tests for AI tool-calling behavior — not general LLM benchmarks, but application-specific checks that catch behavior regressions after changing prompts, tools, schemas, or orchestration.

Each run seeds an isolated, disposable company through the real service layer (not direct DB writes), runs a fixed set of prompts against the same `system` + `tools` the live route uses, and tears the company down afterward.

The suite covers:

- explicit requests → correct tool and correct arguments
- missing required data (customer, price) → the write is not executed
- entity context → implicit reuse across turns is prevented; explicit references ("this customer") are resolved correctly
- destructive operations → deletion requires real SDK approval, not just a proposed call
- fake or conversational "approval" in plain text → cannot bypass the approval mechanism
- irrelevant questions → no ERP tool call
- unsupported operations (cancellation) → no simulated workaround
- multi-step workflows → required intermediate reads (e.g. a stock check before a sale) are allowed within one turn

Run it:

```bash
npm run eval
```

Requires `GOOGLE_GENERATIVE_AI_API_KEY` and a non-production `DATABASE_URL` — this makes real, billed calls to the model and writes to (then deletes from) the database.

### Current result

```text
Result: 11/11 passed
```

The evaluator checks both the tool calls the model proposed and which ones actually executed, including expected arguments and the approval boundary specifically.

## Tech stack

Next.js 16 (App Router, Route Handlers) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Auth.js (NextAuth v5, Credentials + JWT) · Vercel AI SDK with Google Gemini (`gemini-3.5-flash-lite`) — tool calling, streaming, tool approval · Zod · PostgreSQL via a custom Prisma-based ORM (`@prisma/orm-postgres`) · ESLint, Prettier, Husky, lint-staged

## Project structure

```text
src/
├── app/
│   ├── api/chat/          POST /api/chat — validates, streams, persists
│   ├── api/auth/          NextAuth route handlers
│   ├── actions/           server actions (chat, user registration)
│   ├── (app)/             authenticated pages (chat, customers, products, ...)
│   ├── login/ register/
├── components/
│   ├── chat/              chat UI, tool status, approval dialog
│   ├── confirmation-dialog/
│   └── layout/ navigation/ ui/
└── server/
    ├── ai/
    │   ├── system-prompt.ts
    │   ├── erp-tools.ts        aggregates all domain tool factories
    │   ├── tools/               one file per domain
    │   └── evals/                seed, cases, runner (see AI evaluation)
    └── <domain>/                customers, suppliers, products, warehouses,
                                  warehouse-stock, stock-movements,
                                  purchase-invoice(-items), sales-invoice(-items),
                                  invoice-sequences, chat, messages, users
prisma/ (schema, contract, generated client)
```

Business logic lives in `server/<domain>` services — never in components or tool definitions. Tools are a thin translation layer between the model and the services.

## Getting started

Requirements: Node.js, a PostgreSQL database, a Google Gemini API key.

```bash
npm install
```

Copy `.env.example` to `.env` and fill in:

```env
# PostgreSQL connection string (Neon, local, etc.)
# Example: postgresql://user:password@host:5432/dbname?sslmode=require
DATABASE_URL=

# Google AI Studio / Gemini API key
# https://aistudio.google.com/apikey
GOOGLE_GENERATIVE_AI_API_KEY=

# NextAuth secret — random string, e.g.: openssl rand -base64 32
AUTH_SECRET=
```

Generate the ORM client contract:

```bash
npm run contract:emit
```

Seed demo data (company, user, customers, suppliers, products, warehouses, invoices, stock movements) and start the app:

```bash
npx tsx src/server/seed-demo.ts
npm run dev
```

Open http://localhost:3000.

## Limitations

- Simplified distribution domain: no taxes/accounting beyond a flat tax amount, no procurement or logistics workflows
- No roles or permissions beyond company-level isolation — any user in a company has full access to that company's data
- Invoice cancellation is not implemented
- Reporting is limited: aggregates such as stock valuation have no dedicated tools
- Model behavior depends on an external provider and is not fully deterministic
- The AI eval suite is run manually, not gated in CI, given the cost and latency of real model calls
