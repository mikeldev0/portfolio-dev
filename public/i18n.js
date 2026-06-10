const SUPPORTED_LANGS = ["en", "es", "fr", "de", "it"];

function getNested(obj, key) {
  return key.split(".").reduce((o, k) => (o || {})[k], obj);
}

async function loadLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = "en";
  const res = await fetch(`/locales/${lang}.json`);
  const data = await res.json();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const text = getNested(data, key);
    if (text) {
      el.innerHTML = text;
    }
  });
  document.querySelectorAll("[data-i18n-href]").forEach((el) => {
    const key = el.dataset.i18nHref;
    const href = getNested(data, key);
    if (href) {
      el.href = href;
    }
  });
  document.documentElement.lang = lang;
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
