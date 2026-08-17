const SUPPORTED_LANGS = ["en", "es", "fr", "de", "it"];

function getNested(obj, key) {
  return key.split(".").reduce((o, k) => (o || {})[k], obj);
}

window.__t = {};

window.t = function (key) {
  if (!key || typeof key !== "string") return key;
  return getNested(window.__t, key) || key;
};

async function loadLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = "en";
  const res = await fetch(`/locales/${lang}.json`);
  window.__t = await res.json();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const text = getNested(window.__t, key);
    if (text) {
      el.textContent = text;
    }
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.dataset.i18nHtml;
    const html = getNested(window.__t, key);
    if (html) {
      el.innerHTML = html;
    }
  });
  document.querySelectorAll("[data-i18n-href]").forEach((el) => {
    const key = el.dataset.i18nHref;
    const href = getNested(window.__t, key);
    if (href) {
      el.href = href;
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    const placeholder = getNested(window.__t, key);
    if (placeholder) {
      el.setAttribute("placeholder", placeholder);
    }
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.dataset.i18nAriaLabel;
    const ariaLabel = getNested(window.__t, key);
    if (ariaLabel) {
      el.setAttribute("aria-label", ariaLabel);
    }
  });
  document.documentElement.lang = lang;
  window.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
}

function initLang() {
  let lang = localStorage.getItem("lang") || navigator.language.slice(0, 2) || "es";
  if (!SUPPORTED_LANGS.includes(lang)) lang = "en";
  const selector = document.getElementById("language-selector");
  if (selector) {
    selector.value = lang;
    selector.addEventListener("change", (e) => {
      const newLang = e.target.value;
      localStorage.setItem("lang", newLang);
      loadLang(newLang);
    });
  }
  loadLang(lang);
}

initLang();
