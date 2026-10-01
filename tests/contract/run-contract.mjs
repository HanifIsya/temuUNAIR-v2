#!/usr/bin/env node
/* eslint-disable no-undef, @typescript-eslint/no-unused-vars */
import { execSync, spawn } from "node:child_process";
import http from "node:http";
import { existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

console.log("Running contract verification suite...");

// 1. Run Vitest on contract specifications (TC-I18N-001)
try {
  execSync("pnpm exec vitest run i18n-keys.spec.ts", { stdio: "inherit" });
} catch (err) {
  process.exit(1);
}

// 2. Run Schemathesis if available
const openApiPath = resolve(
  import.meta.dirname,
  "../../docs/04-contracts/backend/BE-02-openapi.yaml",
);
if (!existsSync(openApiPath)) {
  console.log("OpenAPI contract not found; skipping Schemathesis phase.");
  process.exit(0);
}

let schemathesisRunner = null;
try {
  execSync("schemathesis --version", { stdio: "ignore" });
  schemathesisRunner = ["schemathesis"];
} catch {
  try {
    execSync("uv --version", { stdio: "ignore" });
    schemathesisRunner = ["uv", "run", "--with", "schemathesis", "schemathesis"];
  } catch {
    try {
      execSync("pipx --version", { stdio: "ignore" });
      schemathesisRunner = ["pipx", "run", "schemathesis"];
    } catch {
      schemathesisRunner = null;
    }
  }
}

if (!schemathesisRunner) {
  console.log(
    "notice: schemathesis/uv/pipx not available in current environment; OpenAPI fuzz phase skipped.",
  );
  process.exit(0);
}

console.log("Executing Schemathesis contract verification against OpenAPI...");

const examples = {
  "API-SYS-01": { status: "ok" },
  "API-SYS-02": { db: "ok", storage: "ok", ml: "degraded" },
  "API-META-01": [
    {
      value: "ID_CARD",
      labelKey: "category.ID_CARD",
      isSensitive: true,
      hintPrompts: ["Nama depan di kartu?"],
    },
  ],
  "API-META-03": [
    {
      id: "018f2c6e-4b3a-7c9d-8e1f-2a3b4c5d6e7f",
      campus: "KAMPUS_B",
      name: "Perpustakaan",
    },
  ],
};

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url || "/", "http://127.0.0.1");
  const path = parsed.pathname;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Request-Id", "req-mock-12345");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    res.end(
      JSON.stringify({
        error: {
          code: "METHOD_NOT_ALLOWED",
          message: "Method not allowed",
          requestId: "req-mock-12345",
        },
      }),
    );
    return;
  }

  res.statusCode = 200;
  if (path === "/healthz") {
    res.end(JSON.stringify(examples["API-SYS-01"]));
  } else if (path === "/readyz") {
    res.end(JSON.stringify(examples["API-SYS-02"]));
  } else if (path === "/api/v1/meta/categories") {
    res.end(JSON.stringify(examples["API-META-01"]));
  } else if (path === "/api/v1/meta/locations") {
    res.end(JSON.stringify(examples["API-META-03"]));
  } else {
    res.statusCode = 404;
    res.end(
      JSON.stringify({
        error: {
          code: "NOT_FOUND",
          message: "Not found",
          requestId: "req-mock-12345",
        },
      }),
    );
  }
});

await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

try {
  const [bin, ...prefixArgs] = schemathesisRunner;
  const args = [
    ...prefixArgs,
    "--no-color",
    "run",
    "--url",
    `http://127.0.0.1:${port}`,
    openApiPath,
    "--max-examples",
    "1",
    "--checks",
    "not_a_server_error,content_type_conformance,response_headers_conformance,response_schema_conformance",
    "--generation-database",
    ":memory:",
    "--suppress-health-check",
    "all",
  ];

  const exitCode = await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(bin, args, {
      stdio: "inherit",
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        PYTHONLEGACYWINDOWSSTDIO: "0",
      },
    });
    child.on("close", resolvePromise);
    child.on("error", rejectPromise);
  });

  if (exitCode !== 0) {
    console.error(`Schemathesis failed with exit code ${exitCode}`);
    process.exit(exitCode);
  }
  console.log("Schemathesis contract fuzz phase: OK");
} finally {
  server.close();
  try {
    const rootSchemathesis = resolve(import.meta.dirname, "../../.schemathesis");
    if (existsSync(rootSchemathesis)) {
      rmSync(rootSchemathesis, { recursive: true, force: true });
    }
    const localSchemathesis = resolve(import.meta.dirname, ".schemathesis");
    if (existsSync(localSchemathesis)) {
      rmSync(localSchemathesis, { recursive: true, force: true });
    }
  } catch (_e) {
    // ignore cleanup errors
  }
}
