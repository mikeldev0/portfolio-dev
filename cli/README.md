# mikeldev CLI

Official command-line interface for [mikeldev.com](https://www.mikeldev.com), the public
portfolio of Mikel Echeverria. It talks to the versioned, read-only public API — no API key
required.

## Usage

```sh
npx mikeldev profile            # human-readable profile card
npx mikeldev profile --json     # raw JSON payload
npx mikeldev openapi            # fetch the OpenAPI contract
mikeldev help                   # usage
```

Options:

- `--url <base>` — target another deployment (default `https://www.mikeldev.com`)
- `--json` — print the raw JSON instead of formatted output

## How it works

- `profile` calls `GET /api/v1/profile` and unwraps `{ ok, data }`.
- `openapi` calls `GET /openapi.json`.
- Rate limits: 120 requests per client per 60 s; on HTTP 429 the CLI prints the server's hint.

## Publish

From this directory (requires npm credentials with access to the `mikeldev` package name):

```sh
npm publish
```
