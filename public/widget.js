/*!
 * 613 Webring — embeddable widget
 * -------------------------------------------------------------------------
 * Drop this on your site to join the loop:
 *
 *   <div id="webring-613"></div>
 *   <script src="https://613webring.xyz/widget.js" defer></script>
 *
 * The widget figures out which ring it belongs to from its own <script src>,
 * so it always points back to the right place. It renders inside a Shadow DOM
 * so it can't clash with — or be clobbered by — your site's styles.
 *
 * Optional <script> attributes:
 *   data-target="#some-element"   where to mount (default: #webring-613, else <body>)
 *   data-theme="light" | "dark" | "auto"   (default: auto)
 *   data-label="613 Webring"      center label text
 */
(function () {
  "use strict";

  var me =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      for (var i = s.length - 1; i >= 0; i--) {
        if (s[i].src && /widget\.js(\?|$)/.test(s[i].src)) return s[i];
      }
      return null;
    })();

  var base = "";
  try {
    base = new URL(me.src, location.href).origin;
  } catch (e) {
    base = "";
  }

  var origin = location.origin;
  var theme = (me && me.getAttribute("data-theme")) || "auto";
  var label = (me && me.getAttribute("data-label")) || "613 Webring";
  var targetSel = me && me.getAttribute("data-target");

  function hop(dir) {
    return base + "/nav?dir=" + dir + "&site=" + encodeURIComponent(origin);
  }

  function mount() {
    var host = document.createElement("div");
    host.className = "webring-613-host";

    var target =
      (targetSel && document.querySelector(targetSel)) || document.getElementById("webring-613");
    if (target) {
      target.appendChild(host);
    } else {
      document.body.appendChild(host);
    }

    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

    var dark =
      theme === "dark" ||
      (theme === "auto" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    var bg = dark ? "#171b22" : "#ffffff";
    var fg = dark ? "#f3efe7" : "#1a1714";
    var muted = dark ? "#aab1bd" : "#5c544b";
    var border = dark ? "#333b48" : "#d4c7b2";
    var accent = dark ? "#f2564f" : "#d92f2f";

    var css =
      ".wr{box-sizing:border-box;display:inline-flex;align-items:center;gap:.35rem;" +
      "font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;" +
      "background:" +
      bg +
      ";color:" +
      fg +
      ";border:1px solid " +
      border +
      ";border-radius:999px;padding:.3rem .4rem;box-shadow:0 2px 10px rgba(0,0,0,.08);" +
      "font-size:14px;line-height:1;max-width:100%}" +
      ".wr a{display:inline-flex;align-items:center;gap:.3rem;text-decoration:none;color:inherit;" +
      "padding:.35rem .55rem;border-radius:999px;transition:background .15s,color .15s}" +
      ".wr a:hover{background:" +
      (dark ? "#222934" : "#f3ede1") +
      ";color:" +
      accent +
      "}" +
      ".wr .arrow{font-family:ui-monospace,monospace;font-weight:700}" +
      ".wr .mid{font-weight:600;letter-spacing:-.01em;padding-inline:.2rem}" +
      ".wr .mid b{color:" +
      accent +
      ";font-family:ui-monospace,monospace}" +
      ".wr .dice{color:" +
      muted +
      "}" +
      ".wr svg{display:block}";

    var ring =
      '<svg width="18" height="18" viewBox="0 0 100 100" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="34" fill="none" stroke="' +
      accent +
      '" stroke-width="6" opacity=".4"/>' +
      '<circle cx="50" cy="16" r="9" fill="' +
      accent +
      '"/><circle cx="79.4" cy="33" r="9" fill="' +
      accent +
      '"/>' +
      '<circle cx="79.4" cy="67" r="9" fill="' +
      accent +
      '"/><circle cx="50" cy="84" r="9" fill="' +
      accent +
      '"/>' +
      '<circle cx="20.6" cy="67" r="9" fill="' +
      accent +
      '"/><circle cx="20.6" cy="33" r="9" fill="' +
      accent +
      '"/></svg>";

    var html =
      "<style>" +
      css +
      "</style>" +
      '<nav class="wr" aria-label="' +
      label +
      '">' +
      '<a class="arrow" href="' +
      hop("prev") +
      '" title="Previous site in the ring" rel="noopener">&larr;</a>' +
      '<a class="mid" href="' +
      base +
      '" title="' +
      label +
      '" rel="noopener" target="_blank">' +
      ring +
      "<span><b>613</b> Webring</span></a>" +
      '<a class="dice" href="' +
      hop("random") +
      '" title="Random site in the ring" rel="noopener">&#9166;</a>' +
      '<a class="arrow" href="' +
      hop("next") +
      '" title="Next site in the ring" rel="noopener">&rarr;</a>' +
      "</nav>";

    root.innerHTML = html;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
