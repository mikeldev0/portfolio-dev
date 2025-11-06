(() => {
  "use strict";
  const e = [
      { code: "en" },
      { code: "es" },
      { code: "fr" },
      { code: "de" },
      { code: "it" },
    ],
    n = e.map(({ code: e }) => e),
    o = () => {
      let o;
      try {
        if ("undefined" != typeof localStorage) {
          const e =
            localStorage.getItem("lang") ?? localStorage.getItem("language");
          o =
            "string" == typeof e ? e.slice(0, 2).toLowerCase() : void 0;
        }
      } catch {
        o = void 0;
      }
      if (!o) {
        try {
          o =
            "undefined" != typeof navigator && navigator.language
              ? navigator.language.slice(0, 2).toLowerCase()
              : void 0;
        } catch {
          o = void 0;
        }
      }
      return n.includes(o ?? "") ? o : "en";
    };
  async function t(t) {
    const a = o(),
      r = await (async function (e) {
        try {
          const n = await fetch(`/locales/${e}.json`),
            o = await n.json();
          return o.languageNames ?? {};
        } catch {
          return {
            en: "English",
            es: "Español",
            fr: "Français",
            de: "Deutsch",
            it: "Italiano",
          };
        }
      })(a);
    (t.innerHTML = e
      .map(({ code: e }) => `<option value="${e}">${r[e] ?? e}</option>`)
      .join("")),
      (t.value = a);
  }
  async function a() {
    const n = document.getElementById("language-selector");
    n &&
      (await t(n),
      n.addEventListener("change", (e) => {
        const n = e.currentTarget;
        if (!n) return;
        const o = n.value;
        !(function (e) {
          try {
            localStorage.setItem("lang", e), localStorage.removeItem("language");
          } catch {}
        })(o);
      }));
  }
  "undefined" != typeof document &&
    ("loading" === document.readyState
      ? document.addEventListener("DOMContentLoaded", () => {
          a();
        })
      : a());
})();
