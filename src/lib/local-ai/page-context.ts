const MAX_VISIBLE_CONTEXT_CHARACTERS = 12000;

function normalizeVisibleText(text: string): string {
  return text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function createVisiblePageContext(document: Document): string {
  const pageRoot = document.querySelector("main") ?? document.body;
  const visibleText = normalizeVisibleText(pageRoot?.innerText ?? pageRoot?.textContent ?? "");
  const limitedText =
    visibleText.length > MAX_VISIBLE_CONTEXT_CHARACTERS
      ? `${visibleText.slice(0, MAX_VISIBLE_CONTEXT_CHARACTERS).trimEnd()}\n[Context truncated]`
      : visibleText;

  return [
    `Page title: ${document.title}`,
    `Page URL: ${window.location.href}`,
    `Current page language: ${document.documentElement.lang || "es"}`,
    "Visible page content:",
    limitedText,
  ].join("\n");
}
