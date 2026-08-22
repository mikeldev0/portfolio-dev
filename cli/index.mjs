#!/usr/bin/env node
import { DEFAULT_BASE_URL, fetchJson, formatProfile, parseArgs } from "./lib.mjs";

const HELP = `mikeldev — official CLI for mikeldev.com

Usage: mikeldev <command> [--url <base>] [--json]

Commands:
  profile   Print the canonical public portfolio profile
  openapi   Print the OpenAPI contract
  help      Show this message

Options:
  --url <base>  API base URL (default: ${DEFAULT_BASE_URL})
  --json        Output raw JSON
`;

const { command, baseUrl, json } = parseArgs(process.argv.slice(2));

try {
  if (command === "profile") {
    const data = await fetchJson(baseUrl, "/api/v1/profile");
    console.log(json ? JSON.stringify(data, null, 2) : formatProfile(data));
  } else if (command === "openapi") {
    const spec = await fetchJson(baseUrl, "/openapi.json");
    console.log(JSON.stringify(spec, null, 2));
  } else {
    console.log(HELP);
  }
} catch (error) {
  console.error(`mikeldev: ${error.message}`);
  process.exitCode = 1;
}
