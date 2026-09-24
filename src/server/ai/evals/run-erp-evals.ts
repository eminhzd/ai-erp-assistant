import 'dotenv/config';

import { google } from '@ai-sdk/google';
import { generateText, stepCountIs } from 'ai';

import { createErpTools } from '@/server/ai/erp-tools';
import { ERP_SYSTEM_PROMPT } from '@/server/ai/system-prompt';

import {
  buildErpToolCallCases,
  type EvalCase,
} from './cases/erp-tool-calls.eval';

import { cleanupEvalData, cleanupStaleEvalData, seedEvalData } from './seed';

type ActualToolCall = {
  toolName: string;
  args: unknown;
};

type CaseResult = {
  id: string;
  passed: boolean;
  reason?: string;
  actualToolCalls: ActualToolCall[];
  actualToolResultNames: string[];
  actualText?: string;
};

async function runCase(
  evalCase: EvalCase,
  companyId: number,
): Promise<CaseResult> {
  const tools = createErpTools(companyId);

  const messages = [
    ...(evalCase.history ?? []),
    {
      role: 'user' as const,
      content: evalCase.userMessage,
    },
  ];

  const result = await generateText({
    model: google('gemini-3.6-flash-lite'),
    system: ERP_SYSTEM_PROMPT,
    messages,
    tools,
    temperature: 0,
    maxRetries: 0,
    stopWhen: stepCountIs(8),
  });

  const actualToolCalls: ActualToolCall[] = result.toolCalls
    .filter(
      (
        toolCall,
      ): toolCall is typeof toolCall & {
        toolName: string;
        input: unknown;
      } =>
        'toolName' in toolCall &&
        typeof toolCall.toolName === 'string' &&
        'input' in toolCall,
    )
    .map((toolCall) => ({
      toolName: toolCall.toolName,
      args: toolCall.input,
    }));

  const actualToolResultNames = result.toolResults
    .filter(
      (
        toolResult,
      ): toolResult is typeof toolResult & {
        toolName: string;
      } => 'toolName' in toolResult && typeof toolResult.toolName === 'string',
    )
    .map((toolResult) => toolResult.toolName);

  const evaluation = evaluateCase(
    evalCase,
    actualToolCalls,
    actualToolResultNames,
  );

  return {
    id: evalCase.id,
    passed: evaluation.passed,
    reason: evaluation.reason,
    actualToolCalls,
    actualToolResultNames,
    actualText: result.text || undefined,
  };
}

function evaluateCase(
  evalCase: EvalCase,
  actualToolCalls: ActualToolCall[],
  actualToolResultNames: string[],
): { passed: boolean; reason?: string } {
  const expected = evalCase.expected;

  if (expected.kind === 'no-tool-call') {
    if (actualToolCalls.length > 0) {
      return {
        passed: false,
        reason: `Expected no tool call, got: ${actualToolCalls
          .map((call) => call.toolName)
          .join(', ')}`,
      };
    }

    return {
      passed: true,
    };
  }

  if (expected.kind === 'must-not-call') {
    const forbiddenCall = actualToolCalls.find(
      (call) => call.toolName === expected.toolName,
    );

    if (forbiddenCall) {
      return {
        passed: false,
        reason: `Tool "${expected.toolName}" must not be called for this case`,
      };
    }

    return {
      passed: true,
    };
  }

  if (expected.kind === 'tool-call') {
    const actualCall = actualToolCalls.find(
      (call) => call.toolName === expected.toolName,
    );

    if (!actualCall) {
      return {
        passed: false,
        reason: `Expected tool "${expected.toolName}" to be called`,
      };
    }

    if (!actualToolResultNames.includes(expected.toolName)) {
      return {
        passed: false,
        reason: `Tool "${expected.toolName}" was called but not executed`,
      };
    }

    if (!partialMatch(actualCall.args, expected.args)) {
      return {
        passed: false,
        reason: [
          `Arguments mismatch for "${expected.toolName}".`,
          `Expected: ${JSON.stringify(expected.args)}`,
          `Actual: ${JSON.stringify(actualCall.args)}`,
        ].join(' '),
      };
    }

    return {
      passed: true,
    };
  }

  // expected.kind === 'requires-approval'

  const actualCall = actualToolCalls.find(
    (call) => call.toolName === expected.toolName,
  );

  if (!actualCall) {
    return {
      passed: false,
      reason: `Expected tool "${expected.toolName}" to be requested`,
    };
  }

  if (actualToolResultNames.includes(expected.toolName)) {
    return {
      passed: false,
      reason: `Tool "${expected.toolName}" executed without approval`,
    };
  }

  return {
    passed: true,
  };
}

function partialMatch(actual: unknown, expected: unknown): boolean {
  if (
    expected === null ||
    typeof expected !== 'object' ||
    Array.isArray(expected)
  ) {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

  if (actual === null || typeof actual !== 'object') {
    return false;
  }

  if (Array.isArray(actual)) {
    return false;
  }

  const actualRecord = actual as Record<string, unknown>;
  const expectedRecord = expected as Record<string, unknown>;

  return Object.entries(expectedRecord).every(([key, expectedValue]) => {
    const actualValue = actualRecord[key];

    if (
      expectedValue !== null &&
      typeof expectedValue === 'object' &&
      !Array.isArray(expectedValue)
    ) {
      return partialMatch(actualValue, expectedValue);
    }

    if (Array.isArray(expectedValue)) {
      return JSON.stringify(actualValue) === JSON.stringify(expectedValue);
    }

    return JSON.stringify(actualValue) === JSON.stringify(expectedValue);
  });
}

function printCaseResult(result: CaseResult): void {
  const status = result.passed ? 'PASS' : 'FAIL';

  console.log(`[${status}] ${result.id}`);

  if (!result.passed && result.reason) {
    console.log(`       ${result.reason}`);
  }

  if (result.actualToolCalls.length > 0) {
    console.log(
      `       tool calls: ${result.actualToolCalls
        .map((call) => call.toolName)
        .join(', ')}`,
    );
  }

  if (result.actualToolResultNames.length > 0) {
    console.log(
      `       tool results: ${result.actualToolResultNames.join(', ')}`,
    );
  }
}

async function main(): Promise<void> {
  let companyId: number | undefined;

  try {
    await cleanupStaleEvalData();

    const context = await seedEvalData();

    companyId = context.companyId;

    const cases = buildErpToolCallCases(context);
    const results: CaseResult[] = [];

    for (const evalCase of cases) {
      const result = await runCase(evalCase, context.companyId);

      results.push(result);
      printCaseResult(result);
    }

    const passed = results.filter((result) => result.passed).length;

    const total = results.length;

    console.log('');
    console.log(`Result: ${passed}/${total} passed`);

    if (passed !== total) {
      process.exitCode = 1;
    }
  } finally {
    if (companyId !== undefined) {
      await cleanupEvalData(companyId);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
