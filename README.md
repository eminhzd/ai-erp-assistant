# AI ERP Assistant

An AI-powered ERP assistant that allows users to manage and query business data through a natural-language chat interface.

The project combines a modern Next.js application with a multi-tenant ERP backend and an AI tool-calling layer. Instead of generating database queries directly, the AI interacts with the ERP through explicitly defined tools backed by domain services and business rules.

The project was built as a portfolio project to explore the architecture and practical integration of AI into a real business application.

## Features

### AI Assistant

- Natural-language interaction with ERP data
- Tool calling for business operations
- Context-aware conversations
- Streaming AI responses
- Tool execution status in the chat UI
- Automatic persistence of user and assistant messages
- Guardrails for ambiguous operations
- Structured error handling between the application and AI layer

The assistant can perform operations such as:

- Create, update, retrieve and delete customers
- Create and retrieve suppliers
- Create and retrieve products
- Manage warehouses
- Query warehouse stock
- Create purchase invoices
- Create sales invoices
- Query stock movements
- Perform inventory adjustments

For ambiguous business operations, the assistant is instructed to request clarification instead of making assumptions. For example, when asked to "mark invoice 15 as paid", it must determine whether the invoice is a purchase or sales invoice before proceeding.

### ERP Domain

The application models a simplified but realistic distribution business:

- Companies
- Users
- Customers
- Suppliers
- Products
- Warehouses
- Warehouse stock
- Purchase invoices
- Purchase invoice items
- Sales invoices
- Sales invoice items
- Stock movements

Inventory changes are represented through stock movements:

- `PURCHASE`
- `SALE`
- `ADJUSTMENT_IN`
- `ADJUSTMENT_OUT`

Purchase and sales operations update warehouse stock as part of the same transaction, keeping the invoice and inventory state consistent.

### Authentication & Multi-tenancy

- Authentication with Auth.js
- Credentials-based login
- Company-based tenant isolation
- Every ERP query is scoped to the authenticated user's company
- Unauthenticated users are redirected to the login page

The company context is propagated into the service and AI tool layers, preventing tools from accessing data belonging to another company.

## Architecture

The project follows a layered architecture where business logic is kept independent from individual entry points.

```text
                    ┌─────────────────────┐
                    │      Chat UI        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Chat API Route   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      AI Layer       │
                    │                     │
                    │ System Prompt       │
                    │ Tool Registry       │
                    │ ERP Tools           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Domain Services   │
                    │                     │
                    │ Customers           │
                    │ Products            │
                    │ Invoices            │
                    │ Stock               │
                    │ Warehouses           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Prisma ORM      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   PostgreSQL / Neon │
                    └─────────────────────┘
```

### Why this architecture?

The AI layer does not contain the ERP business logic itself.

AI tools act as an interface between the language model and the existing domain services:

```text
AI Tool → Domain Service → Database
```

This keeps business rules independent from the AI provider and makes the same services reusable from other application entry points.

For example:

```text
Client
  ↓
Server Action
  ↓
Domain Service
  ↓
Database
```

and:

```text
AI Tool
  ↓
Domain Service
  ↓
Database
```

The API route also calls services directly where appropriate instead of routing requests through Server Actions.

This avoids duplicating business logic between Server Actions and AI tools.

## AI Tool Architecture

ERP capabilities are exposed to the model through dedicated tool modules.

```text
src/server/ai/
├── erp-tools.ts
├── system-prompt.ts
└── tools/
    ├── customer-tools.ts
    ├── product-tools.ts
    ├── purchase-invoice-items-tools.ts
    ├── purchase-invoice-tools.ts
    ├── sales-invoice-items-tools.ts
    ├── sales-invoice-tools.ts
    ├── stock-movement-tools.ts
    ├── supplier-tools.ts
    ├── warehouse-stock-tools.ts
    └── warehouse-tools.ts
```

The central tool registry determines which ERP capabilities are available to the assistant.

Each tool:

1. Validates its input with Zod.
2. Receives the authenticated `companyId`.
3. Calls the appropriate domain service.
4. Converts application errors into useful AI-facing responses.
5. Returns structured information to the model.

The model never receives unrestricted database access.

## Error Handling

Error handling was designed around the distinction between expected business errors and unexpected system failures.

The domain layer uses explicit application errors such as:

- `ValidationError`
- `NotFoundError`
- `ConflictError`

For example:

```text
Invalid quantity
        ↓
ValidationError
        ↓
AI Tool
        ↓
Readable tool result
        ↓
AI explains the problem to the user
```

This allows the assistant to respond naturally to business constraints instead of exposing raw database or application errors.

Examples include:

- Product does not exist
- Customer does not belong to the current company
- Invoice does not contain the requested product
- Stock is insufficient
- Invoice and stock movement do not match
- Duplicate stock movement
- Invalid invoice references

The AI is therefore able to distinguish between an operation that failed because of a business rule and an unexpected application failure.

## Inventory Model

Inventory is not stored as a single manually updated number.

Warehouse stock is affected by stock movements generated by business operations.

```text
Purchase Invoice
      ↓
PURCHASE movement
      ↓
Warehouse Stock ↑
```

```text
Sales Invoice
      ↓
SALE movement
      ↓
Warehouse Stock ↓
```

Manual corrections use:

```text
ADJUSTMENT_IN
ADJUSTMENT_OUT
```

Stock-related operations are executed transactionally so that the movement and corresponding stock change are committed together.

This prevents partially applied inventory operations.

## Database

The application uses PostgreSQL hosted on Neon and Prisma ORM.

The main entities are:

```text
Company
 ├── User
 ├── Customer
 ├── Supplier
 ├── Product
 ├── Warehouse
 │     └── WarehouseStock
 ├── PurchaseInvoice
 │     └── PurchaseInvoiceItem
 ├── SalesInvoice
 │     └── SalesInvoiceItem
 └── StockMovement
```

The `Company` entity acts as the tenant boundary.

Every business query includes the company context to enforce tenant isolation at the service layer.

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Base UI
- Lucide Icons

### Backend

- Next.js App Router
- Server Actions
- Route Handlers
- Domain/service layer
- Auth.js

### AI

- AI SDK
- Google Gemini
- Tool calling
- Zod schemas
- Streaming responses

### Database

- PostgreSQL
- Neon
- Prisma ORM

### Developer Tooling

- ESLint
- Prettier
- Husky
- lint-staged

## UI & Responsive Design

The application was designed around a desktop ERP workflow while remaining usable on smaller screens.

### Desktop

The desktop layout uses:

- Persistent sidebar
- Chat navigation
- New Chat action
- Header actions
- Main conversation area

### Mobile

At smaller screen widths:

- The persistent sidebar is hidden
- Navigation is opened through a menu button
- The New Chat action moves into the header
- Sidebar functionality is exposed through a mobile drawer

The mobile navigation is designed to reuse the same navigation structure as the desktop sidebar rather than maintaining separate navigation logic.

## Project Structure

```text
src/
├── app/
│   ├── (chat)/
│   │   ├── chat/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── actions/
│   │   ├── chat.actions.ts
│   │   ├── message.actions.ts
│   │   └── user.actions.ts
│   │
│   ├── api/
│   │   ├── auth/
│   │   └── chat/
│   │
│   ├── login/
│   ├── register/
│   └── globals.css
│
├── components/
│   ├── chat/
│   ├── confirmation-dialog/
│   ├── layout/
│   ├── navigation/
│   └── ui/
│
├── server/
│   ├── ai/
│   │   ├── tools/
│   │   └── erp-tools.ts
│   │
│   ├── chat/
│   ├── customers/
│   ├── messages/
│   ├── products/
│   ├── purchase-invoice/
│   ├── purchase-invoice-items/
│   ├── sales-invoice/
│   ├── sales-invoice-items/
│   ├── stock-movements/
│   ├── suppliers/
│   ├── users/
│   ├── warehouse-stock/
│   ├── warehouses/
│   └── seed-demo.ts
│
└── prisma/
```

## Getting Started

### Prerequisites

- Node.js
- PostgreSQL database
- Google Gemini API key

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

Create an environment file:

```env
DATABASE_URL="your-postgresql-connection-string"
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
AUTH_SECRET="your-auth-secret"
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Demo Data

The project includes a demo seed that creates:

- A demo company
- A demo user
- Customers
- Suppliers
- Products
- Warehouses
- Purchase invoices
- Sales invoices
- Stock movements

Run the seed with:

```bash
npx tsx src/server/seed-demo.ts
```

The seed creates realistic business data that can be used to test the ERP assistant immediately after setup.

## Example Prompts

After logging in, the assistant can be tested with prompts such as:

```text
Show me all customers.
```

```text
How much Coca-Cola 0.5L do we have?
```

```text
Show me the stock in the Main Warehouse.
```

```text
Which products are low in stock?
```

```text
Create a customer called North Star Café.
```

```text
Create a sales invoice for The Corner Kitchen.
```

```text
Create a purchase invoice from PepsiCo.
```

```text
What is the total value of our current stock?
```

The assistant can also handle situations where additional clarification is required instead of guessing the user's intent.

## Development Approach

The project was developed incrementally rather than starting with the AI layer first.

The development process focused on building the underlying ERP functionality before exposing it to the model:

```text
Database
   ↓
Domain Services
   ↓
Business Rules & Transactions
   ↓
Authentication & Tenant Isolation
   ↓
AI Tools
   ↓
AI Error Handling
   ↓
Chat UI
   ↓
Responsive UI
```

This approach makes the AI integration an additional application layer rather than the foundation of the business logic.

The final stage focused on integrating all ERP capabilities into the AI tool layer, improving AI-facing error handling, and refining the UI for desktop and mobile use.

## What This Project Demonstrates

The main purpose of the project is to demonstrate practical experience with:

- React and Next.js application architecture
- TypeScript
- Server-side application design
- Domain/service-oriented architecture
- PostgreSQL data modeling
- Prisma ORM
- Multi-tenant data isolation
- Authentication
- Transactional inventory operations
- AI tool calling
- Structured AI inputs with Zod
- AI-specific error handling
- Streaming interfaces
- Responsive UI design
- Separation of business logic from presentation and AI layers

Rather than treating an LLM as a direct database interface, the project uses explicit tools and domain services to constrain what the assistant can do and ensure that ERP operations still follow application-level business rules.
