export const DEFAULT_BASE_URL = "https://www.mikeldev.com";

export function parseArgs(argv) {
  const parsed = { command: "help", baseUrl: DEFAULT_BASE_URL, json: false };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--url") {
      parsed.baseUrl = argv[i + 1] || parsed.baseUrl;
      i += 1;
    } else if (argv[i] === "--json") {
      parsed.json = true;
    } else if (argv[i] === "--help" || argv[i] === "-h") {
      parsed.command = "help";
    } else if (!argv[i].startsWith("-")) {
      parsed.command = argv[i];
    }
  }

  return parsed;
}

export async function fetchJson(baseUrl, path, fetchImpl = fetch) {
  const response = await fetchImpl(`${baseUrl.replace(/\/+$/, "")}${path}`, {
    headers: { Accept: "application/json" },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = payload?.error ? `${payload.error.message} ${payload.error.hint}` : "";
    throw new Error(`HTTP ${response.status}${detail ? ` — ${detail.trim()}` : ""}`);
  }
  if (!payload?.ok) {
    throw new Error(`Unexpected payload from ${path}`);
  }

  return payload.data;
}

export function formatProfile(data) {
  return [
    `${data.name} (${data.alternateName})`,
    data.role,
    `Location: ${data.location.city}, ${data.location.region}, ${data.location.country}`,
    `Email: ${data.email}`,
    `Web: ${data.url}`,
    "",
    "Resources:",
    ...Object.entries(data.resources).map(([name, url]) => `  ${name}: ${url}`),
  ].join("\n");
}
