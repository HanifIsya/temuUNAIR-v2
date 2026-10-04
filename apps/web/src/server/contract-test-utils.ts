// TMU-BE-003: contract assertions for backend tests.
//
// Test files under apps/web are typechecked by tsconfig.test.json, which does not
// enable `allowImportingTsExtensions`. Every module inside packages/contracts/src
// imports its siblings with explicit `.ts` specifiers, so a static import would
// fail `pnpm typecheck` with TS5097 (root tsconfig*.json is ops-lane and cannot be
// changed here). Importing through a non-literal dynamic specifier keeps tsc from
// loading those files while vite-node still resolves them at runtime, so the
// assertions below always run against the real merged contract schemas.

type Parseable = { parse: (data: unknown) => unknown };

const testingSpecifier = "@temuunair/contracts/src/testing";
const registrySpecifier = "@temuunair/contracts/src/registry";

export interface ContractTestApi {
  expectMatchesContract: (apiId: string, payload: unknown, schema: Parseable) => void;
  responseSchema: (apiId: string) => Parseable;
}

let cached: Promise<ContractTestApi> | null = null;

export function loadContractApi(): Promise<ContractTestApi> {
  cached ??= (async () => {
    const testing = (await import(testingSpecifier)) as {
      expectMatchesContract: ContractTestApi["expectMatchesContract"];
    };
    const registry = (await import(registrySpecifier)) as {
      registryById: Map<string, { response: Parseable }>;
    };
    return {
      expectMatchesContract: testing.expectMatchesContract,
      responseSchema: (apiId: string) => {
        const entry = registry.registryById.get(apiId);
        if (!entry) throw new Error(`Unknown API id: ${apiId}`);
        return entry.response;
      },
    };
  })();
  return cached;
}
