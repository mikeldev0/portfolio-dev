(() => {
  "use strict";
  const e = [
      { code: "en" },
      { code: "es" },
      { code: "fr" },
      { code: "de" },
      { code: "it" },
    ],
    n = () => {
      var e;
      try {
        return null !==
          (e =
            "undefined" != typeof localStorage
              ? localStorage.getItem("language")
              : null) && void 0 !== e
          ? e
          : "en";
      } catch {
        return "en";
      }
    };
  async function o(o) {
    const t = n(),
      a = await (async function (e) {
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
      })(t);
    (o.innerHTML = e
      .map(({ code: n }) => `<option value="${n}">${a[n] ?? n}</option>`)
      .join("")),
      (o.value = t);
  }
  async function t() {
    const t = document.getElementById("language-selector");
    t &&
      (await o(t),
      t.addEventListener("change", (e) => {
        const o = e.currentTarget;
        if (!o) return;
        const t = o.value;
        !(function (e) {
          try {
            localStorage.setItem("language", e);
          } catch {}
        })(t),
          window.location.reload();
      }));
  }
  "undefined" != typeof document &&
    ("loading" === document.readyState
      ? document.addEventListener("DOMContentLoaded", () => {
          t();
        })
      : t());
})();
