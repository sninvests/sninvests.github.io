(function () {
  "use strict";
  var CFG = Object.assign({ videos: [], social: [] }, window.SN_CONFIG || {});
  var API = "https://api.mfapi.in";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  var money = function (n) { return "₹" + inr.format(Math.round(n)); };

  /* ---------- toast ---------- */
  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 4200);
  }

  /* ---------- modals ---------- */
  var lastFocus = null;
  function openModal(id) {
    var m = document.getElementById(id); if (!m) return;
    lastFocus = document.activeElement; m.hidden = false;
    document.body.style.overflow = "hidden";
    var x = $("[data-close]", m); if (x) x.focus();
  }
  function closeModal(m) {
    m.hidden = true; document.body.style.overflow = "";
    if (m.id === "videoModal") $("#player").innerHTML = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$(".modal").forEach(function (m) {
    m.addEventListener("click", function (e) { if (e.target === m) closeModal(m); });
    $$("[data-close]", m).forEach(function (b) { b.addEventListener("click", function () { closeModal(m); }); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    $$(".modal").forEach(function (m) { if (!m.hidden) closeModal(m); });
    closeMenu();
  });
  $$("[data-open]").forEach(function (b) { b.addEventListener("click", function () { openModal(b.dataset.open); }); });

  /* ---------- portal modal (Check Your Portfolio / User Login) ---------- */
  $$("[data-open-portal]").forEach(function (b) {
    b.addEventListener("click", function () {
      var login = b.dataset.openPortal === "login";
      $("#portalTitle").textContent = login ? "User login" : "Check your portfolio";
      $("#portalText").textContent = login
        ? "Sign in to view your holdings, or get a consolidated statement from the official registrars."
        : "Get a consolidated statement of every mutual fund you hold, from the official registrars.";
      closeMenu(); openModal("portalModal");
    });
  });
  if (CFG.loginUrl) { $("#loginLink").href = CFG.loginUrl; $("#loginRow").hidden = false; }

  /* ---------- mobile menu ---------- */
  var nav = $("#nav"), menuBtn = $("#menuBtn");
  function closeMenu() { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", closeMenu); });

  var linkById = {};
  $$("a", nav).forEach(function (a) { linkById[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        $$("a", nav).forEach(function (a) { a.classList.remove("is-current"); });
        var a = linkById[en.target.id]; if (a) a.classList.add("is-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(linkById).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- config → page ---------- */
  var digits = function (s) { return String(s || "").replace(/\D/g, ""); };
  if (CFG.phone) {
    $("#cPhone").textContent = CFG.phone; $("#cPhone").href = "tel:+" + (digits(CFG.phone).length === 10 ? "91" : "") + digits(CFG.phone);
    $('[data-cfg="phone"]').hidden = false;
    $("#fPhone").textContent = CFG.phone; $("#fPhone").hidden = false;
  }
  if (CFG.email) { $("#cEmail").textContent = CFG.email; $("#cEmail").href = "mailto:" + CFG.email; $('[data-cfg="email"]').hidden = false; }
  if (CFG.address) { $("#cAddress").textContent = CFG.address; $('[data-cfg="address"]').hidden = false; }
  if (CFG.arn) {
    var arn = "ARN-" + CFG.arn.replace(/^ARN[-\s]*/i, "") + (CFG.arnValidTill ? ", valid till " + CFG.arnValidTill : "");
    $("#arnLine").textContent = arn; $("#arnLine").hidden = false;
    $("#fArn").textContent = "AMFI registered mutual fund distributor, " + arn; $("#fArn").hidden = false;
  }
  if (CFG.irdaiNote) $("#irdai").textContent = CFG.irdaiNote;
  if (CFG.schemeAnnexureUrl) $("#annexureLink").href = CFG.schemeAnnexureUrl;
  if (CFG.social && CFG.social.length) {
    CFG.social.forEach(function (s) {
      var li = document.createElement("li"), a = document.createElement("a");
      a.href = s.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = s.label; li.appendChild(a);
      $("#socialList").appendChild(li);
    });
    $("#socialBlock").hidden = false;
  }
  $("#yr").textContent = new Date().getFullYear();
  if (CFG.heroVideo) {
    var hv = $("#heroVideo"); hv.src = CFG.heroVideo; hv.hidden = false;
    var p = hv.play(); if (p && p.catch) p.catch(function () {});
  }

  /* ---------- hero slider ---------- */
  var slides = $$(".slide"), panes = $$(".ledger-pane"), dotsBox = $("#dots"), cur = 0, timer = null;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  slides.forEach(function (_, i) {
    var d = document.createElement("button");
    d.type = "button"; d.className = "dot"; d.setAttribute("role", "tab");
    d.setAttribute("aria-label", "Go to slide " + (i + 1));
    d.addEventListener("click", function () { show(i, true); });
    dotsBox.appendChild(d);
  });
  function show(i, user) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle("is-active", k === cur); });
    panes.forEach(function (s, k) { s.classList.toggle("is-active", k === cur); });
    $$(".dot").forEach(function (d, k) { d.setAttribute("aria-selected", String(k === cur)); });
    if (user) stop();
  }
  function play() { if (reduce || timer) return; timer = setInterval(function () { show(cur + 1); }, 7000); }
  function stop() { clearInterval(timer); timer = null; }
  $("#prevSlide").addEventListener("click", function () { show(cur - 1, true); });
  $("#nextSlide").addEventListener("click", function () { show(cur + 1, true); });
  var hero = $("#home");
  hero.addEventListener("mouseenter", stop); hero.addEventListener("mouseleave", play);
  hero.addEventListener("focusin", stop);
  show(0); play();

  /* ---------- enquiry shortcuts ---------- */
  function enquire(service) {
    var sel = $("#eService");
    if (service) {
      var has = $$("option", sel).some(function (o) { return o.value === service || o.textContent === service; });
      if (has) sel.value = service;
    }
    $("#contact").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    setTimeout(function () { $("#eName").focus({ preventScroll: true }); }, 450);
  }
  $$("[data-enquire]").forEach(function (b) { b.addEventListener("click", function () { closeMenu(); enquire(b.dataset.enquire); }); });

  /* ---------- calculators ---------- */
  function fv(P, ratePct, months) {
    var i = ratePct / 1200;
    return P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  }
  var num = function (id) { return parseFloat($(id).value); };

  function calcSip() {
    var P = num("#sipAmt"), r = num("#sipRate"), y = num("#sipYears");
    if (!(P > 0 && r > 0 && y > 0)) {
      ["#sipInvested", "#sipGain", "#sipTotal"].forEach(function (s) { $(s).textContent = "-"; }); return;
    }
    var total = fv(P, r, Math.round(y * 12)), invested = P * Math.round(y * 12);
    $("#sipInvested").textContent = money(invested);
    $("#sipGain").textContent = money(total - invested);
    $("#sipTotal").textContent = money(total);
  }
  function calcDelay() {
    var P = num("#dlyAmt"), y = num("#dlyYears"), d = num("#dlyMonths"), n = Math.round(y * 12);
    var out = $("#dlyLoss"), txt = $("#dlyText");
    if (!(P > 0 && y > 0 && d > 0)) { out.textContent = "-"; txt.textContent = "Enter an amount, a duration and a delay."; return; }
    if (d >= n) { out.textContent = "-"; txt.textContent = "The delay must be shorter than the duration."; return; }
    out.textContent = money(fv(P, 12, n) - fv(P, 12, n - Math.round(d)));
    txt.textContent = "If you delay starting by just " + Math.round(d) + " month" + (Math.round(d) === 1 ? "" : "s") + ".";
  }
  $("#sipForm").addEventListener("submit", function (e) { e.preventDefault(); calcSip(); });
  $("#delayForm").addEventListener("submit", function (e) { e.preventDefault(); calcDelay(); });
  $$("#sipForm input").forEach(function (i) { i.addEventListener("input", calcSip); });
  $$("#delayForm input").forEach(function (i) { i.addEventListener("input", calcDelay); });
  calcSip(); calcDelay();

  /* ---------- NAV data (AMFI via mfapi.in) ---------- */
  function getJSON(url) {
    var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, 15000);
    return fetch(url, { signal: ctl.signal }).then(function (r) {
      clearTimeout(t); if (!r.ok) throw new Error("HTTP " + r.status); return r.json();
    }).catch(function (e) { clearTimeout(t); throw e; });
  }
  function searchSchemes(q) {
    return getJSON(API + "/mf/search?q=" + encodeURIComponent(q)).then(function (list) {
      if (!Array.isArray(list)) return [];
      var skip = /idcw|dividend|payout|bonus|segregated/i;
      var main = list.filter(function (s) { return !skip.test(s.schemeName); });
      var use = main.length ? main : list;
      use.sort(function (a, b) { return /growth/i.test(b.schemeName) - /growth/i.test(a.schemeName); });
      return use.slice(0, 12);
    });
  }
  var cache = {};
  function parseDate(s) { var p = s.split("-"); return new Date(+p[2], +p[1] - 1, +p[0]); }
  function loadScheme(code) {
    if (cache[code]) return Promise.resolve(cache[code]);
    return getJSON(API + "/mf/" + code).then(function (j) {
      if (!j || !j.data || !j.data.length) throw new Error("No NAV data");
      var series = j.data.map(function (r) { return { d: parseDate(r.date), v: parseFloat(r.nav), raw: r.date }; })
        .filter(function (r) { return r.v > 0; });
      var latest = series[0];
      function ret(years) {
        var target = new Date(latest.d); target.setFullYear(target.getFullYear() - years);
        var past = null;
        for (var i = 0; i < series.length; i++) { if (series[i].d <= target) { past = series[i]; break; } }
        if (!past) return null;
        var ratio = latest.v / past.v;
        return years === 1 ? (ratio - 1) * 100 : (Math.pow(ratio, 1 / years) - 1) * 100;
      }
      var out = { code: code, name: (j.meta && j.meta.scheme_name) || "Scheme " + code,
        house: j.meta && j.meta.fund_house, cat: j.meta && j.meta.scheme_category,
        nav: latest.v, date: latest.raw, r1: ret(1), r3: ret(3), r5: ret(5) };
      cache[code] = out; return out;
    });
  }
  function fmtPct(v) { return v == null ? "-" : (v > 0 ? "+" : "") + v.toFixed(2); }
  function pctClass(v) { return v == null ? "" : v >= 0 ? "up" : "down"; }

  function renderPicks(ul, items, onPick) {
    ul.innerHTML = "";
    var li;
    if (!items.length) { li = document.createElement("li"); var p = document.createElement("p"); p.textContent = "No schemes found. Try a shorter name, like the fund house and category."; li.appendChild(p); ul.appendChild(li); return; }
    items.forEach(function (s) {
      li = document.createElement("li");
      var b = document.createElement("button"); b.type = "button"; b.textContent = s.schemeName;
      b.addEventListener("click", function () { onPick(s); });
      li.appendChild(b); ul.appendChild(li);
    });
  }
  function note(ul, msg) { ul.innerHTML = ""; var li = document.createElement("li"), p = document.createElement("p"); p.textContent = msg; li.appendChild(p); ul.appendChild(li); }

  function wireSearch(o) {
    function run(q) {
      q = (q || "").trim();
      if (q.length < 2) { note(o.list, "Type at least two letters of the fund name."); return; }
      note(o.list, "Searching…");
      searchSchemes(q).then(function (items) { renderPicks(o.list, items, function (s) { o.list.innerHTML = ""; o.onPick(s); }); })
        .catch(function () { note(o.list, "Couldn't reach the NAV service. Check your connection and search again."); });
    }
    o.go.addEventListener("click", function () { run(o.input.value); });
    o.input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); run(o.input.value); } });
    return run;
  }

  /* Check NAV */
  var navCard = $("#navCard");
  wireSearch({ input: $("#navQ"), go: $("#navGo"), list: $("#navPicks"), onPick: function (s) {
    navCard.hidden = false; navCard.textContent = "Loading NAV…";
    loadScheme(s.schemeCode).then(function (f) {
      navCard.innerHTML = "";
      var h = document.createElement("h4"); h.textContent = f.name;
      var m = document.createElement("div"); m.className = "meta"; m.textContent = [f.house, f.cat].filter(Boolean).join(" | ");
      var big = document.createElement("div"); big.className = "big"; big.textContent = "₹" + f.nav.toFixed(4);
      var d = document.createElement("div"); d.className = "meta"; d.textContent = "NAV as on " + f.date;
      var rets = document.createElement("div"); rets.className = "rets";
      [["1Y", f.r1], ["3Y", f.r3], ["5Y", f.r5]].forEach(function (x) {
        var c = document.createElement("div"), l = document.createElement("span"), v = document.createElement("b");
        l.textContent = x[0] + " return"; v.textContent = fmtPct(x[1]) + (x[1] == null ? "" : "%"); v.className = pctClass(x[1]);
        c.appendChild(l); c.appendChild(v); rets.appendChild(c);
      });
      [h, m, big, d, rets].forEach(function (n) { navCard.appendChild(n); });
    }).catch(function () { navCard.textContent = "Couldn't load this scheme's NAV. Try again in a moment."; });
  } });

  /* Compare */
  var funds = [], body = $("#cmpBody"), cmpList = $("#cmpPicks");
  function renderTable() {
    body.innerHTML = "";
    if (!funds.length) {
      var tr0 = document.createElement("tr"); tr0.className = "empty";
      var td0 = document.createElement("td"); td0.colSpan = 6; td0.textContent = "Search above to add funds to this table.";
      tr0.appendChild(td0); body.appendChild(tr0); return;
    }
    funds.forEach(function (f, idx) {
      var tr = document.createElement("tr");
      var n = document.createElement("td"); n.className = "name"; n.textContent = f.name;
      var sm = document.createElement("small"); sm.textContent = [f.house, f.cat].filter(Boolean).join(" | "); n.appendChild(sm);
      tr.appendChild(n);
      var nv = document.createElement("td"); nv.className = "num"; nv.textContent = f.nav.toFixed(2); tr.appendChild(nv);
      [f.r1, f.r3, f.r5].forEach(function (v) {
        var td = document.createElement("td"); td.className = "num " + pctClass(v); td.textContent = fmtPct(v); tr.appendChild(td);
      });
      var a = document.createElement("td"), b = document.createElement("button");
      b.type = "button"; b.className = "rm"; b.textContent = "Remove"; b.setAttribute("aria-label", "Remove " + f.name);
      b.addEventListener("click", function () { funds.splice(idx, 1); renderTable(); });
      a.appendChild(b); tr.appendChild(a); body.appendChild(tr);
    });
  }
  var cmpRun = wireSearch({ input: $("#cmpQ"), go: $("#cmpGo"), list: cmpList, onPick: function (s) {
    if (funds.some(function (f) { return String(f.code) === String(s.schemeCode); })) { toast("That fund is already in the table."); return; }
    if (funds.length >= 5) { toast("You can compare up to five funds. Remove one first."); return; }
    toast("Adding fund…");
    loadScheme(s.schemeCode).then(function (f) { funds.push(f); renderTable(); toast("Added to comparison."); })
      .catch(function () { toast("Couldn't load that fund. Try again in a moment."); });
  } });
  $$(".chip").forEach(function (c) { c.addEventListener("click", function () { $("#cmpQ").value = c.dataset.q; cmpRun(c.dataset.q); }); });

  /* ---------- videos ---------- */
  var vidGrid = $("#vidGrid");
  function playerOpen(node) { var p = $("#player"); p.innerHTML = ""; p.appendChild(node); openModal("videoModal"); }
  (CFG.videos || []).forEach(function (v) {
    var el, thumb = document.createElement("div"); thumb.className = "thumb";
    if (v.youtubeId || v.file) {
      el = document.createElement("button"); el.type = "button";
      var src = v.poster || (v.youtubeId ? "https://i.ytimg.com/vi/" + v.youtubeId + "/hqdefault.jpg" : "");
      if (src) { var im = document.createElement("img"); im.src = src; im.alt = ""; im.loading = "lazy"; thumb.appendChild(im); }
      el.addEventListener("click", function () {
        if (v.youtubeId) {
          var f = document.createElement("iframe");
          f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.youtubeId) + "?autoplay=1&rel=0";
          f.allow = "autoplay; encrypted-media; picture-in-picture"; f.allowFullscreen = true; f.title = v.title; playerOpen(f);
        } else {
          var vd = document.createElement("video"); vd.src = v.file; vd.controls = true; vd.autoplay = true; vd.playsInline = true; if (v.poster) vd.poster = v.poster; playerOpen(vd);
        }
      });
    } else {
      el = document.createElement("a");
      el.href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(v.search || v.title);
      el.target = "_blank"; el.rel = "noopener";
    }
    el.className = "vid";
    var pb = document.createElement("span"); pb.className = "playbtn"; pb.innerHTML = '<svg class="ic"><use href="#i-play"/></svg>'; thumb.appendChild(pb);
    var t = document.createElement("div"); t.className = "vid-title"; t.textContent = v.title;
    if (!v.youtubeId && !v.file) { var s = document.createElement("small"); s.textContent = "Opens on YouTube"; t.appendChild(s); }
    el.appendChild(thumb); el.appendChild(t); vidGrid.appendChild(el);
  });
  if (!(CFG.videos || []).length) $("#videos").hidden = true;

  /* ---------- KYC ---------- */
  $("#kycForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var pan = $("#pan").value.trim().toUpperCase(), err = $("#panErr");
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      err.textContent = "Enter a valid PAN: five letters, four digits, one letter."; err.hidden = false; $("#pan").focus(); return;
    }
    err.hidden = true;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(pan).catch(function () {});
    toast("PAN copied. Paste it on the CVL KRA page.");
    window.open("https://www.cvlkra.com/", "_blank", "noopener");
  });

  /* ---------- enquiry form ---------- */
  $("#enquiry").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("#eName").value.trim(), ph = digits($("#ePhone").value), svc = $("#eService").value, msg = $("#eMsg").value.trim();
    var err = $("#eErr");
    function fail(m, el) { err.textContent = m; err.hidden = false; el.focus(); }
    if (name.length < 2) return fail("Enter your name.", $("#eName"));
    if (ph.length < 10 || ph.length > 13) return fail("Enter a phone number with at least 10 digits.", $("#ePhone"));
    err.hidden = true;
    var text = "New enquiry from the website\nName: " + name + "\nPhone: " + $("#ePhone").value.trim() + "\nInterested in: " + svc + (msg ? "\nMessage: " + msg : "");
    if (digits(CFG.whatsapp)) {
      window.open("https://wa.me/" + digits(CFG.whatsapp) + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      toast("Opening WhatsApp. Press send to share your enquiry.");
    } else if (CFG.email) {
      window.location.href = "mailto:" + CFG.email + "?subject=" + encodeURIComponent("Enquiry: " + svc) + "&body=" + encodeURIComponent(text);
      toast("Opening your email app. Press send to share your enquiry.");
    } else {
      fail("This form isn't connected yet. Add a WhatsApp number or email in config.js.", $("#eName"));
    }
  });
})();
