/* DRAFT (internal) family display. Plain JS, no build step. Example data only. */
(async function () {
  const Q = new URLSearchParams(location.search);
  const D = window.HYPX_EXAMPLE;
  const DEFAULTS = { family:{name:"Example family"}, members:[], theme:"light", rotationSeconds:20,
    screens:{today:true,deliveries:true,budget:true,slideshow:true}, screenOrder:["today","deliveries","budget","slideshow"],
    budget:{hideAmounts:true,revealSeconds:20}, slideshow:{secondsPerPhoto:10,photos:["img/placeholder-dusk.jpg"]},
    mic:{mode:"tap"} };
  let S = Object.assign({}, DEFAULTS, window.HYPX_SETTINGS || {});
  const members = S.members.length ? S.members : [{id:"alex",name:"Alex",initial:"A",color:"m1"},{id:"sam",name:"Sam",initial:"S",color:"m2"},{id:"riley",name:"Riley",initial:"R",color:"m3"},{id:"jo",name:"Jo",initial:"J",color:"m4"}];
  const M = Object.fromEntries(members.map(m => [m.id, m]));
  const STATIC = Q.get("static") === "1";
  const LS_KEY = "hypx-family-wall-demo-v1";
  const store = { get() { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {}; } catch (e) { return {}; } },
    set(o) { try { localStorage.setItem(LS_KEY, JSON.stringify(Object.assign(store.get(), o))); } catch (e) {} },
    clear() { try { localStorage.removeItem(LS_KEY); } catch (e) {} } };
  const SAVED = store.get();
  let apvMode = SAVED.approvals === "sent" ? "sent" : "any";   // REVIEW: who can approve on the wall
  function BD() { const B = D.budget; if (!budgetOver) return B; return { day: B.day, days: B.days, cats: B.cats.map(c => c.name === "Groceries" ? { name: c.name, spent: c.spent + 450, plan: c.plan } : c) }; }
  /* concierge name: one field, concierge.name, default "Concierge", max 14 characters (concierge.nameMaxLength) */
  const CC = S.concierge || {};
  const NAME_MAX = CC.nameMaxLength || 14;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  let nameRaw = (Q.get("name") != null ? Q.get("name") : (SAVED.name != null ? SAVED.name : (CC.name != null ? CC.name : "Concierge")));
  let CNraw, CN, CNthe;
  function setName(raw) { nameRaw = String(raw).slice(0, NAME_MAX); CNraw = nameRaw.trim() || "Concierge"; CN = esc(CNraw); CNthe = CN === "Concierge" ? "the Concierge" : CN; }   // "Answered by the Concierge" / "Answered by Juniper"
  setName(nameRaw);
  const VOICES = (window.HYPX_VOICES || []).filter(v => v.id && String(v.id).toLowerCase() !== "claudia");
  const SPEED_MIN = 0.7, SPEED_MAX = 1.5, SPEED_DEF = 1;
  const clampSpeed = n => { const x = Number(n); if (!Number.isFinite(x)) return SPEED_DEF; return Math.min(SPEED_MAX, Math.max(SPEED_MIN, Math.round(x * 10) / 10)); };
  const voiceIdOf = v => (v && typeof v === "object") ? String(v.id || "").toLowerCase() : String(v || "").toLowerCase();
  const DEFAULT_VOICE = "eve";
  let voiceSel = voiceIdOf(Q.get("voice") || SAVED.voice || CC.voice) || DEFAULT_VOICE;
  if (!VOICES.some(v => v.id === voiceSel)) voiceSel = DEFAULT_VOICE;
  let voiceSpeed = clampSpeed(Q.get("speed") || Q.get("voiceSpeed") || SAVED.speed || CC.voiceSpeed || SPEED_DEF);
  let voiceFilt = (Q.get("filter") || "all").toLowerCase();
  let voicePlaying = Q.get("playing") || "";
  let vScroll = 0, scrollVoiceIntoView = true;
  const vname = v => esc(v.name || (v.id ? v.id.charAt(0).toUpperCase() + v.id.slice(1) : ""));
  const order = (S.screenOrder || DEFAULTS.screenOrder).filter(k => S.screens[k]);

  /* ---------- icons ---------- */
  const P = {
    mic:'<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff:'<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    wifioff:'<path d="M3 3l18 18M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 3.2-2M2 9.2a15 15 0 0 1 4.3-2.7M10.7 5.1A15 15 0 0 1 22 9.2M13.9 8.9A10 10 0 0 1 19 12.9"/><circle cx="12" cy="20" r=".8" fill="currentColor"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
    pause:'<path d="M9 5v14M15 5v14"/>',
    hand:'<path d="M12 3v9M8 6v8M16 6v8M5 11v3a7 7 0 0 0 14 0v-3"/>',
    spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    outbox:'<path d="M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5"/>',
    trend:'<path d="M4 16l5-5 4 4 7-8"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    play:'<path d="M8 5.5v13l11-6.5z"/>',
    moon:'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
    alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.1"/>',
    back:'<path d="M15 5l-7 7 7 7"/>'
  };
  const ic = (n, c="") => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

  /* ---------- clock (demo clock starts at the example time and runs; static freezes it) ---------- */
  const startMin = (t => { const [h,m] = t.split(":").map(Number); return h*60+m; })(Q.get("time") || D.startTime);
  const t0 = Date.now();
  const nowMin = () => startMin;   // demo: the clock stays at the example time so every example stays consistent
  const toMin = t => { const [h,m] = t.split(":").map(Number); return h*60+m; };
  const fmt = (min, short) => { let h = Math.floor(min/60)%24, m = Math.floor(min%60); const ap = h>=12?"PM":"AM"; h = h%12||12; return short ? `${h}:${String(m).padStart(2,"0")}` : `${h}:${String(m).padStart(2,"0")} ${ap}`; };
  const ap = min => (Math.floor(min/60)%24)>=12 ? "PM":"AM";

  /* ---------- derive today's data ---------- */
  function derive() {
    const now = nowMin(); let next = null;
    const per = members.map(m => {
      const ev = (D.events[m.id]||[]).map(e => ({...e, done: toMin(e.e) <= now}));
      ev.forEach(e => { if (!e.done && toMin(e.s) >= now - 0 && (!next || toMin(e.s) < toMin(next.e.s))) next = {m, e}; });
      return {m, ev};
    });
    if (next) next.e.nx = true;
    let then = null;
    per.forEach(p => p.ev.forEach(e => { if (!e.done && e !== (next&&next.e) && toMin(e.s) >= now && (!then || toMin(e.s) < toMin(then.e.s))) then = {m:p.m, e}; }));
    return {now, per, next, then};
  }

  /* ---------- screens ---------- */
  const sk = (w,h,r) => `<span class="sk" style="width:calc(var(--u)*${w});height:calc(var(--u)*${h});${r?"border-radius:50%":""}"></span>`;
  function approvals() {
    const items = apprList.slice(0,3);
    const limit = S.approval_wall_limit != null ? S.approval_wall_limit : 150;
    if (!items.length) return `<section class="card appr"><div class="ah">${ic("phone")}<span>Waiting for approval</span><b class="n">0</b></div>
      <div class="items"><div class="caught">${ic("check")}<span>All caught up. Nothing is waiting on you.</span></div></div></section>`;
    return `<section class="card appr ${offline && !boot ? "off" : ""}"><div class="ah">${ic("phone")}<span>Waiting for approval</span><b class="n">${items.length}</b></div>
      <div class="items">${items.map(i => { const m = M[i.who], over = i.amount > limit;
        return `<div class="ai ${over?"over":""}" data-id="${i.id}"><span class="avatar ${m.color}">${m.initial}</span>
        <div class="ax"><div class="at">${i.item}</div><div class="as">Sent to ${m.name}'s phone</div>
          ${over ? `<div class="ov">Over $${limit} - approve on your phone</div>` : ""}</div>
        ${offline && !boot ? "" : `<div class="ab">${over ? "" : `<button class="b pri" data-act="approve" data-id="${i.id}">Approve</button>`}<button class="b" data-act="decline" data-id="${i.id}">Decline</button></div>`}</div>`; }).join("")}</div>
      ${offline && !boot ? `<div class="offnote">${ic("clock")}Approvals will be back when we reconnect</div>` : ""}</section>`;
  }
  function agentStrip(skel) {
    const n = apprList.length;
    const A = [
      { k:"Concierge", name:CN, st: n ? "wait" : "ok", l: n ? `${n} waiting` : "All caught up", s: n ? `${n} waiting` : "All caught up", ol:"Reconnecting...", os:"Offline" },
      { k:"Calendar", name:"Calendar", st:"ok", l:"Synced", s:"Synced", ol:"3:08 PM", os:"3:08 PM" },
      { k:"Shopper", name:"Shopper", st:"ok", l:"7 orders", s:"7 orders", ol:"3:08 PM", os:"3:08 PM" },
      { k:"Budget", name:"Budget", st:"work", l:"4 charges", s:"4 charges", ol:"3:08 PM", os:"3:08 PM" },
      { k:"Inbox", name:"Inbox", st:"ok", l:"4 new", s:"4 new", ol:"3:08 PM", os:"3:08 PM" }
    ];
    return `<div class="agents">${A.map(a => `<div class="ag ${skel?"skel":(offline?"off":a.st)}" ${skel ? "" : `data-act="agent" data-agent="${a.k}" role="button" tabindex="0" aria-label="${a.name}"`}><span class="sd"></span><div>
      ${skel ? sk(120,22)+sk(150,20) : `<div class="an">${a.name}</div><div class="astat"><span class="sl">${offline ? a.ol : a.l}</span><span class="ss">${offline ? a.os : a.s}</span></div>`}</div></div>`).join("")}</div>`;
  }
  function todaySkeleton() {
    return `<div class="screen" id="s-today"><div class="toprow"><section class="next"><div class="avatar sk"></div><div class="skc">${sk(120,22)}${sk(360,48)}${sk(300,26)}</div><div class="cd">${sk(90,22)}</div></section>
      <section class="card appr"><div class="skc">${sk(240,26)}${sk(300,40)}${sk(300,40)}</div></section></div>
      <div class="members">${members.map(m => `<section class="card mcard"><div class="mhead"><div class="avatar sk"></div><div class="skc">${sk(110,30)}${sk(90,20)}</div></div>
        <div class="skc" style="padding-top:calc(var(--u)*20)">${sk(100,22)}${sk(170,30)}${sk(100,22)}${sk(150,30)}</div></section>`).join("")}</div></div>`;
  }
  function today() {
    const d = derive(), nx = d.next;
    const mins = nx ? Math.round(toMin(nx.e.s) - d.now) : 0;
    const evRow = (e) => `<div class="ev ${e.done?"done":""} ${e.nx?"nx":""}">
      ${e.done ? ic("check","ck") : '<span class="dot"></span>'}
      <div><div class="tm">${fmt(toMin(e.s))}</div><div class="tt">${e.t}</div>${(!e.done && e.p) ? `<div class="pl">${e.p}</div>`:""}</div></div>`;
    const hero = nx ? `<section class="next">
        <div class="avatar ${nx.m.color}">${nx.m.initial}</div>
        <div><div class="eyebrow">Next up</div><h2>${nx.e.t}</h2>
          <div class="meta"><b>${nx.m.name}</b> &nbsp;&middot;&nbsp; ${fmt(toMin(nx.e.s))}${nx.e.p ? " &nbsp;&middot;&nbsp; "+nx.e.p : ""}</div></div>
        <div class="cd"><div class="eyebrow">Starts in</div><div class="big">${mins}<small>min</small></div></div>
      </section>` : "";
    return `<div class="screen" id="s-today"><div class="toprow">${hero}${approvals()}</div>
      <div class="members">${d.per.map(p => `<section class="card mcard ${p.m.color}">
        <div class="mhead"><div class="avatar ${p.m.color}">${p.m.initial}</div>
          <div><div class="nm">${p.m.name}</div><div class="ct">${p.ev.filter(e=>e.done).length} of ${p.ev.length} done</div></div></div>
        ${p.ev.filter(e=>!e.done).map(e => evRow(e)).join("") || '<div class="free">Nothing else today</div>'}</section>`).join("")}</div></div>`;
  }

  const STEPS = ["Ordered","Shipped","Out for delivery","Delivered"];
  const who = m => `<span class="who"><span class="avatar ${m.color}">${m.initial}</span>${m.name}</span>`;
  function pkg(p, hot) {
    const m = M[p.who];
    return `<div class="card pk ${hot?"hot":""}">
      <div class="shop"><span>${p.shop}</span>${who(m)}</div>
      <div class="it">${p.item}</div>
      <div class="eta">${p.eta}</div>
      <div class="steps">${[1,2,3,4].map(n => `<i class="${n<p.step?"on":n===p.step?"now":""}"></i>`).join("")}</div>
      <div class="nt">${STEPS[p.step-1]} &nbsp;&middot;&nbsp; ${p.note}</div></div>`;
  }
  function ret(r) {
    const m = M[r.who];
    return `<div class="card pk ret">
      <div class="shop"><span>${r.shop}</span>${who(m)}</div>
      <div class="it">${r.item}</div>
      <div class="eta">Return by ${r.by}</div>
      <div class="nt"><span class="chip ${r.urgent?"warn":""}">${r.left}</span> &nbsp;${r.note}</div></div>`;
  }
  function deliveries() {
    const x = D.deliveries, more = x.onway.slice(2);
    return `<div class="screen" id="s-deliveries">
      <div class="dcol"><div class="dh"><h3>Arriving today</h3><span class="n">${x.today.length}</span></div>${x.today.map(p=>pkg(p,true)).join("")}</div>
      <div class="dcol"><div class="dh"><h3>On the way</h3><span class="n">${x.onway.length}</span></div>${x.onway.slice(0,2).map(p=>pkg(p)).join("")}
        ${more.length ? `<div class="more">+ ${more.map(p=>`${p.item}, ${p.eta}`).join("; ")}</div>` : ""}</div>
      <div class="dcol ret"><div class="dh"><h3>Returns closing soon</h3><span class="n">${x.returns.length}</span></div>${x.returns.map(ret).join("")}</div></div>`;
  }

  const money = n => "$" + n.toLocaleString("en-US");
  let revealed = Q.get("reveal") === "1";
  function budgetHidden() {
    const B = BD(), spent = B.cats.reduce((a,c)=>a+c.spent,0), plan = B.cats.reduce((a,c)=>a+c.plan,0);
    const overall = spent > plan * (B.day / B.days) ? "Over" : "On track";
    const rows = B.cats.map(c => { const over = c.spent > c.plan;
      return `<div class="brow st"><div class="r1"><div class="cn">${c.name}</div>
        <span class="sbadge ${over?"over":"ok"}">${ic(over?"alert":"check")}${over?"Over":"On track"}</span></div></div>`; }).join("");
    return `<div class="screen hidden-amt status-only" id="s-budget">
      <section class="card bhero bh2">
        <div class="seal ${overall==="Over"?"over":""}">${ic(overall==="Over"?"alert":"check")}</div>
        <div class="bh-t">${overall}</div>
        <div class="bh-s">Overall, month to date</div>
        <button class="reveal2" data-act="open-pin-budget">${ic("lock")}PIN to show amounts</button>
        <div class="pin">${ic("lock")}<span>Amounts only show, or get read aloud, after an adult enters a PIN.</span></div>
      </section>
      <section class="card blist"><div class="bl-head"><span>By category</span><span class="key">Status only. No amounts.</span></div>${rows}</section></div>`;
  }
  function budget() {
    if (!revealed) return budgetHidden();
    const B = BD(), spent = B.cats.reduce((a,c)=>a+c.spent,0), plan = B.cats.reduce((a,c)=>a+c.plan,0);
    const pace = B.day / B.days, usedPct = Math.round(spent/plan*100);
    const circ = 2*Math.PI*118;
    // Hidden state never puts real values in the page: placeholder digits are blurred instead.
    const A = (real, fake) => `<span class="amt">${revealed ? real : fake}</span>`;
    const rows = B.cats.map(c => {
      const w = Math.min(c.spent/c.plan,1)*100, over = c.spent > c.plan;
      return `<div class="brow"><div class="r1"><div class="cn">${c.name}${over?'<span class="flag">Over plan</span>':""}</div>
        <div class="cv">${A(money(c.spent), "$000")} <em>of ${A(money(c.plan), "$000")}</em></div></div>
        <div class="bar ${over?"over":""}"><b style="width:${w}%"></b><span class="tick" style="left:calc(${pace*100}% - 1px)"></span></div></div>`;
    }).join("");
    return `<div class="screen ${revealed?"show-amt":"hidden-amt"}" id="s-budget" data-act="toggle-amt">
      <section class="card bhero">
        <div class="ring"><svg viewBox="0 0 280 280"><circle cx="140" cy="140" r="118" fill="none" stroke="var(--track)" stroke-width="20"/>
          <circle cx="140" cy="140" r="118" fill="none" stroke="var(--ink)" stroke-width="20" stroke-linecap="round" stroke-dasharray="${circ*spent/plan} ${circ}"/>
          <g transform="rotate(${pace*360} 140 140)"><rect x="137.5" y="12" width="5" height="32" rx="2.5" fill="var(--accent)"/></g></svg>
          <div class="rc"><b>${usedPct}%</b><span>of plan used</span></div></div>
        <div class="bamt"><div class="big">${A(money(spent),"$0,000")}</div><div class="of">of ${A(money(plan),"$0,000")} planned</div></div>
        <div style="text-align:center"><span class="status">${ic("trend")}Under pace</span></div>
        <div class="slot"><button class="reveal" data-act="toggle-amt">${ic("eye")}Tap to show amounts</button>
        <div class="rv-note">${ic("eyeoff")}<span>Hides again in ${S.budget.revealSeconds||20} seconds. Tap to hide now.</span></div></div>
        <div class="pin">${ic("lock")}<span>Amounts are only read aloud after you enter a PIN.</span></div>
      </section>
      <section class="card blist"><div class="bl-head"><span>By category</span><span class="key"><i></i>Where you would be by today</span></div>${rows}</section></div>`;
  }

  /* ---------- quiet hours night view (dimmed, clock only) ---------- */
  const QH = S.quiet_hours || {};
  const parseT = (t, d) => { if (t == null) return d; if (typeof t === "number") return t; const m = String(t).trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/); if (!m) return d;
    let h = +m[1]; const ap = (m[3]||"").toLowerCase(); if (ap === "pm" && h < 12) h += 12; if (ap === "am" && h === 12) h = 0; return h*60 + +m[2]; };
  const qStart = parseT(QH.start, 21*60+30), qEnd = parseT(QH.end, 6*60+30);
  const isQuiet = m => (QH.enabled === false) ? false : (qStart > qEnd ? (m >= qStart || m < qEnd) : (m >= qStart && m < qEnd));
  function night() {
    const now = 23*60+42, w = D.weatherNight;
    return `<div class="night"><div class="tag">DRAFT - example data</div>
      <div class="ncenter"><div class="nclock">${fmt(now,true)}<small>${ap(now)}</small></div>
        <div class="ndate">${D.dateLabel}</div>
        <div class="nwx">${ic("moon")}<span>${w.temp}&deg; &middot; ${w.desc}</span></div></div>
      <div class="nfoot"><div class="nq">${ic("moon")}Quiet hours until ${fmt(qEnd)}</div><div class="nt">${ic("hand")}Touch to wake</div></div></div>`;
  }

  /* ---------- Name and voice (PIN-gated settings screen) ---------- */
  const VFILTS = [
    {id:"all", label:"All", test:() => true},
    {id:"a-c", label:"A-C", test:id => id[0] >= "a" && id[0] <= "c"},
    {id:"e-k", label:"E-K", test:id => id[0] >= "e" && id[0] <= "k"},
    {id:"l-p", label:"L-P", test:id => id[0] >= "l" && id[0] <= "p"},
    {id:"r-z", label:"R-Z", test:id => id[0] >= "r" && id[0] <= "z"}
  ];
  if (!VFILTS.some(f => f.id === voiceFilt)) voiceFilt = "all";
  function namevoice() {
    const raw = nameRaw, nm = esc(raw);
    const keys = kbNum ? [["1","2","3","4","5","6","7","8","9","0"],["-","/",":",";","(",")","&","@","$"],[".",",","?","!","'",'"',"#"]]
      : [["Q","W","E","R","T","Y","U","I","O","P"],["A","S","D","F","G","H","J","K","L"],["Z","X","C","V","B","N","M"]];
    const ch = k => kbNum ? k : (kbShift ? k : k.toLowerCase());
    const kcell = k => `<button class="kk" data-kk="${esc(ch(k))}">${esc(k)}</button>`;
    const kb = `<div class="kb">
      <div class="kr">${keys[0].map(kcell).join("")}</div>
      <div class="kr">${keys[1].map(kcell).join("")}</div>
      <div class="kr"><button class="kk wide ${kbShift&&!kbNum?"on":""} ${kbNum?"dis":""}" data-kka="shift">Shift</button>${keys[2].map(kcell).join("")}<button class="kk wide del" data-kka="del">${ic("back")}Delete</button></div>
      <div class="kr"><button class="kk wide" data-kka="num">${kbNum?"ABC":"123"}</button><button class="kk space" data-kk=" ">space</button><button class="kk wide done" data-kka="done">Done</button></div></div>`;
    const filt = VFILTS.find(f => f.id === voiceFilt) || VFILTS[0];
    const shown = VOICES.filter(v => filt.test(v.id));
    const chips = VFILTS.map(f => `<button class="vfc ${f.id===voiceFilt?"on":""}" data-act="vfilt" data-f="${f.id}">${f.label}</button>`).join("");
    const vc = shown.map(v => {
      const sel = v.id === voiceSel, pl = v.id === voicePlaying, isDef = v.id === DEFAULT_VOICE;
      return `<div class="vcard ${sel?"sel":""}" data-voice="${v.id}">
        <div class="vh"><span class="vn">${vname(v)}</span><span class="vbadges">${isDef ? `<span class="vdef">Default</span>` : ""}${sel ? `<span class="vsel" aria-label="Selected">${ic("check")}</span>` : ""}</span></div>
        <div class="vd">${esc(v.tone || "")}</div>
        <button class="vplay ${pl?"on":""}" data-act="play" data-v="${v.id}">${pl ? '<span class="bars"><i></i><i></i><i></i><i></i></span>Playing' : ic("play")+"Play sample"}</button></div>`;
    }).join("");
    const speedLabel = voiceSpeed.toFixed(1);
    return `<div class="screen" id="s-namevoice">
      <section class="card nvl"><div class="nvh"><span class="nvk">Name</span><span class="nvc">${raw.length} of ${NAME_MAX}</span></div>
        <div class="field"><span class="ft">${nm}</span><span class="caret"></span></div>
        <div class="nvp"><span class="nvn">How it reads on the wall</span><span class="hand done">${ic("check")}<span>${esc(raw.trim() || "Concierge")} checked with Shopper</span></span></div>
        <div class="apv"><div class="apvh"><span class="nvk">Approvals</span><span class="apvr">REVIEW</span><span class="apn">You can change this any time in Settings.</span></div>
          <div class="apvs" role="radiogroup" aria-label="Who can approve"><button class="apb ${apvMode==="any"?"on":""}" role="radio" aria-checked="${apvMode==="any"}" data-act="apv" data-v="any">${apvMode==="any"?ic("check"):""}Any adult can approve</button><button class="apb ${apvMode==="sent"?"on":""}" role="radio" aria-checked="${apvMode==="sent"}" data-act="apv" data-v="sent">${apvMode==="sent"?ic("check"):""}Only the person it was sent to</button></div></div>
        ${kb}</section>
      <section class="card nvr"><div class="nvh"><span class="nvk">Voice</span><span class="chip">${VOICES.length} voices</span></div>
        <div class="vspeed">
          <div class="vsh"><span class="nvn">Speaking speed</span><span class="vsv">${speedLabel}</span></div>
          <div class="vsl"><span class="vsend">Slower</span>
            <input type="range" min="${SPEED_MIN}" max="${SPEED_MAX}" step="0.1" value="${speedLabel}" data-act="speed" aria-label="Speaking speed, ${speedLabel}">
            <span class="vsend">Faster</span></div>
        </div>
        <div class="vfilt" role="tablist" aria-label="Filter voices">${chips}</div>
        <div class="vgridwrap"><div class="vgrid">${vc || `<div class="vempty">No voices in this group.</div>`}</div></div></section></div>`;
  }

  let photoIdx = 0;
  function slideshow() {
    const d = derive(), nx = d.next, now = d.now;
    return `<div class="screen" id="s-slideshow">
      ${S.slideshow.photos.map((p,i)=>`<div class="ph ${i===0?"on":""}" style="background-image:url('${p}')"></div>`).join("")}
      <div class="cap"><div class="tm">${fmt(now,true)}<small>${ap(now)}</small></div>
        ${nx ? `<div class="sep"></div><div class="nx"><div class="eyebrow">Next up</div><div class="t">${nx.e.t} <span>&middot; ${nx.m.name}, ${fmt(toMin(nx.e.s))}</span></div></div>` : ""}</div></div>`;
  }

  function micspec() {
    const mk = (st, inner) => `<div class="mic" data-st="${st}"><span class="rp"></span><span class="rp b"></span>${inner}</div>`;
    const panel = (st, name, desc, tap) => `<section class="card mpanel"><div class="stg">${mk(st, ic("mic") + '<span class="bars"><i></i><i></i><i></i><i></i><i></i></span>')}</div>
      <h3>${name}</h3><p>${desc}</p><span class="tap">${tap}</span></section>`;
    return `<div class="screen" id="s-micspec">
      <div class="msg">
      ${panel("idle","Idle","A calm solid button in the bottom right corner of every screen. Tap it to ask something.", "Tap to talk")}
      ${panel("listening","Listening","Filled with the accent color while soft rings pulse outward. Tap again to send.", "Tap to send")}
      ${panel("answering","Answering","Bars move while the answer is spoken. The written answer also shows as a card over the screen.", "Tap to stop")}
      </div>
      <div class="rules"><span>${ic("hand")}Tap to talk</span><span>Same corner on every screen</span><span>Works in light and dark themes</span></div></div>`;
  }

  /* ---------- chrome ---------- */
  const TITLES = {
    today:{e:"Today", t:D.dateLabel, s:`4 people, ${Object.values(D.events).reduce((a,l)=>a+l.length,0)} events`},
    deliveries:{e:"Deliveries", t:"Deliveries", s:`From order confirmation emails. Last checked ${D.deliveries.checked}.`},
    budget:{e:"Budget", t:"November budget", s:`Month to date, day ${D.budget.day} of ${D.budget.days}. Amounts stay hidden until an adult enters a PIN.`},
    slideshow:{e:"Photos", t:"", s:""},
    namevoice:{e:"Settings", t:"Name and voice", s:"Opened with an adult PIN. Changes apply right away. Closes after 2 minutes without a touch."},
    micspec:{e:"Mic button", t:"Tap to talk", s:"Three states. One button. One corner."}
  };
  /* ---------- chrome and state (demo) ---------- */
  const app = document.getElementById("app");
  const layer = document.getElementById("demo-layer");
  const root = document.documentElement;
  if (STATIC) root.classList.add("static");
  let screen = Q.get("screen") || order[0];
  let pinMode = ({"1":"approve", approve:"approve", budget:"budget", settings:"settings"})[Q.get("pin")] || null;
  let pinBuf = pinMode ? "1234".slice(0, Math.min(3, +(Q.get("digits") || 0))) : "";
  let pinErr = "", pinBusy = false, pend = null, returnCard = null, card = null;
  let theme = Q.get("theme") || S.theme;
  let boot = Q.get("boot") === "1";
  let mic = Q.get("mic") || "idle", offline = boot || Q.get("offline") === "1";
  let held = Q.get("autorotate") !== "1";                   // demo: the rotation is paused unless asked for
  let queue = (offline && !boot && Q.get("queued") !== "0") ? D.queued.slice() : [];
  let quietOn = Q.get("screen") === "night", prevScreen = null;
  let apprList = D.approvals.map(a => Object.assign({}, a));
  let budgetOver = Q.get("budget") === "over";
  let kbShift = !nameRaw.length, kbNum = false, snap = null;
  let revealUntil = 0;
  const p = parseFloat(Q.get("p") || "0.42");
  const DEMO_PIN = "1234", PIN_LEN = 4;
  const APPR_META = { water: { merchant: "Example Home Supply", reason: "The filters are due for a swap." }, dishwasher: { merchant: "Sample Home", reason: "The current one stopped draining." } };
  const BG = { light: "#EEEDE9", dark: "#0F1011" };

  function themeNow() {
    if (theme !== "auto") return theme;
    const m = nowMin(), a = toMin((S.autoTheme||{}).darkFrom||"19:30"), b = toMin((S.autoTheme||{}).lightFrom||"06:30");
    return (m >= a || m < b) ? "dark" : "light";
  }
  function micLine() { return mic === "listening" ? "Listening" : ""; }   // neutral state word only
  const pinOwner = () => { const a = pend && apprList.find(x => x.id === pend.id) || apprList[0]; return a && M[a.who] ? M[a.who].name : "Sam"; };
  const pinPrompt = () => { const a = pend && apprList.find(x => x.id === pend.id) || (pend ? null : apprList[0]);
    const verb = pend && pend.action === "decline" ? "Decline" : "Approve";
    return `${verb}: ${a ? a.item : D.pinPrompt.item}`; };

  /* ---------- cards from the card library (same components as the library) ---------- */
  const isoDay = "2026-11-27";
  const iso = min => { const h = Math.floor(min/60)%24, m = Math.floor(min%60); return `${isoDay}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00-08:00`; };
  const mk = (type, via, data) => ({ card_id: type + "-demo", type, version: 1, via, created_at: iso(15*60+8), data });
  function budgetData() {
    const B = BD(), cats = B.cats.slice(0, 3);
    const spent = B.cats.reduce((a,c)=>a+c.spent,0), plan = B.cats.reduce((a,c)=>a+c.plan,0);
    const overall = spent > plan * (B.day / B.days) ? "over" : "on_track";
    const d = { period_label: "November budget", day: B.day, days: B.days, overall, categories: cats.map(c => ({ name: c.name, status: c.spent > c.plan ? "over" : "on_track" })) };
    if (revealed) d.amounts = { spent, plan, categories: cats.map(c => ({ name: c.name, spent: c.spent, plan: c.plan })) };
    return mk("budget_summary", "budget", d);
  }
  function cardList() {
    if (!card) return { html: "", label: "Done" };
    const H = window.HYPXCards, EX = window.HYPX_CARD_EXAMPLES;
    const ctx = Object.assign(H.defaultCtx(window.HYPX_MEMBERS), { name: CNraw, limit: S.approval_wall_limit != null ? S.approval_wall_limit : 150, offline, now: iso(nowMin()) });
    const R = c => H.render(c, ctx);
    let html = "", label = "Done";
    if (card.kind === "calendar") {
      const nx = derive().next;
      if (nx) html += R(mk("calendar_next_up", "calendar", { member: nx.m.id, title: nx.e.t, start: iso(toMin(nx.e.s)), place: nx.e.p }));
      html += R(EX.event);
    } else if (card.kind === "shopper") {
      html += [D.deliveries.today[0], D.deliveries.today[1]].map(x => R(mk("shopper_tracking", "shopper", { shop: x.shop, item: x.item, member: x.who, step: x.step, eta: x.eta, note: x.note }))).join("");
    } else if (card.kind === "budget") {
      html += R(budgetData()).replace('<button class="wc-reveal">', '<button class="wc-reveal" data-act="card-reveal">');
    } else if (card.kind === "inbox") {
      html += R(EX.inbox).replace('<button class="wc-b">', '<button class="wc-b" data-act="inbox-more">');
    } else if (card.kind === "concierge") {
      const a = apprList[0];
      if (!a) html += `<article class="wc" data-card="caught_up"><div class="wc-h"><span class="wc-eb">${'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'}<span>Waiting for approval</span></span></div><div class="wc-t">All caught up</div><div class="wc-s">Nothing is waiting on you.</div></article>`;
      else { const m = M[a.who] || {}; const meta = APPR_META[a.id] || {};
        html += R(mk("approval_request", "shopper", { approval_id: a.id, item: a.item, amount: a.amount, merchant: meta.merchant || "Sample Shop", reason: meta.reason, approver: a.who }))
          .replace('<button class="wc-b pri">Approve</button>', `<button class="wc-b pri" data-act="approve" data-id="${a.id}">Approve</button>`)
          .replace('<button class="wc-b">Decline</button>', `<button class="wc-b" data-act="decline" data-id="${a.id}">Decline</button>`).replace("1 of 1", "1 of " + apprList.length); }
      label = "Close";
    } else if (card.kind === "phone") {
      html += R(Object.assign({}, EX.err_phone, { data: Object.assign({}, EX.err_phone.data, { next_step: `Check the app on ${(M[card.who]||{}).name || "Alex"}'s phone.` }) })); label = "Close";
    } else if (card.kind === "result") {
      html += R(mk("approval_result", "shopper", { outcome: card.outcome, item: card.item, detail: card.outcome === "approved" ? "Shopper is placing the order now." : "Nothing was bought. Shopper has been told." }));
    }
    return { html, label };
  }

  function render() {
    const t = TITLES[screen], now = nowMin();
    const w = D.weather;
    const bodies = { today: boot ? todaySkeleton : today, deliveries, budget, slideshow, micspec, namevoice };
    const thm = screen === "night" ? "night" : themeNow();
    root.setAttribute("data-theme", thm === "night" ? "dark" : thm); root.setAttribute("data-night", thm === "night" ? "1" : "0");
    layer.setAttribute("data-theme", thm === "night" ? "dark" : thm);
    const mt = document.querySelector('meta[name="theme-color"]'); if (mt) mt.setAttribute("content", thm === "dark" || thm === "night" ? (thm === "night" ? "#000000" : BG.dark) : BG.light);
    if (screen === "night") { app.setAttribute("data-theme", "night"); app.setAttribute("data-screen", "night"); app.setAttribute("data-offline","0"); app.setAttribute("data-boot","0"); app.setAttribute("data-pin","0"); app.setAttribute("data-answer","0"); app.setAttribute("data-card","0"); app.setAttribute("data-mic","idle"); app.innerHTML = night(); afterRender(); return; }
    const PINS = { approve: {pq: pinPrompt()}, budget: {pq: "Show amounts: November budget"}, settings: {pq: "Settings: Name and voice"} };
    const pm = pinMode && PINS[pinMode] ? pinMode : null;
    app.setAttribute("data-theme", thm);
    app.setAttribute("data-screen", screen);
    app.setAttribute("data-mic", mic);
    app.setAttribute("data-offline", offline ? "1" : "0");
    app.setAttribute("data-boot", boot ? "1" : "0");
    app.setAttribute("data-pin", pm ? "1" : "0");
    app.setAttribute("data-card", card ? "1" : "0");
    app.setAttribute("data-answer", ((mic === "answering" || mic === "working") && !offline) ? "1" : "0");
    const idx = order.indexOf(screen);
    const cl = cardList();
    app.innerHTML = `
      <div class="tag">DRAFT - example data${screen==="slideshow"?" - placeholder photo":""}</div>
      ${screen==="slideshow" ? bodies.slideshow() : ""}
      <div class="stage">
        <header class="top"><div><div class="eyebrow">${S.family.name}${t.e && screen!=="today" ? " &nbsp;&middot;&nbsp; "+t.e : ""}</div><div class="title">${t.t}</div>${offline && !boot ? `<div class="sub"><span class="offline-chip">${ic("wifioff")}${CN} is reconnecting</span></div>` : `<div class="sub">${t.s}</div>`}</div>
          <div class="top-r">
            ${screen==="today" && boot ? `<div class="wx">${sk(250,58)}</div>` : ""}${screen==="today" && !boot ? `<div class="wx">${ic(w.icon)}<div><b>${w.temp}&deg;</b><span>${w.desc} &middot; High ${w.hi}&deg; Low ${w.lo}&deg;</span></div></div>` : ""}
            <div class="clock">${fmt(now,true)}<small>${ap(now)}</small></div></div></header>
        <main>${screen==="slideshow" ? "" : bodies[screen]()}</main>
        <footer class="bottom">
          ${screen==="namevoice" ? `<div class="nvact"><button class="b2" data-act="close-settings">Cancel</button><button class="b2 pri" data-act="save-settings">${ic("check")}Save changes</button></div>` : `<div class="rotwrap"><button class="gear" data-act="open-pin-settings" aria-label="Settings">${ic("gear")}</button>
          <div class="rot"><div class="dots">${order.map((k,i)=>`<i class="${i===idx?"on":""}" data-act="goto" data-s="${k}">${i===idx?`<b style="--p:${held?100:p*100}%"></b>`:""}</i>`).join("")}</div>
            <div class="hint" data-act="hold">${held ? ic("pause")+"Held. Tap to resume" : "Tap to hold"}</div></div></div>`}
          ${screen==="today" ? agentStrip(boot) : ""}
          <div class="mic-zone">${micLine() ? `<div class="mic-line">${micLine()}</div>` : ""}
            <button class="mic" id="mic" data-st="${mic}" aria-label="Tap to talk"><span class="rp"></span><span class="rp b"></span>${ic("mic")}<span class="bars"><i></i><i></i><i></i><i></i><i></i></span></button></div>
        </footer>
        <div class="veil p"></div>
        <div class="card pinpad"><div class="pq">${pm ? PINS[pm].pq : ""}</div><h2>Enter your PIN</h2>
          <div class="pd ${pinErr?"bad":""}">${Array.from({length:PIN_LEN}, (_, i)=>`<i class="${i<pinBuf.length?"f":""}"></i>`).join("")}</div>
          ${pinErr ? `<div class="pmsg">${pinErr}</div>` : ""}
          <div class="pk3">${["1","2","3","4","5","6","7","8","9","Cancel","0","Delete"].map(k=>`<button class="k ${k.length>1?"w":""}" data-k="${k}">${k}</button>`).join("")}</div>
          <div class="pf">${ic("lock")}From ${CNthe}. PIN is checked on our server and never stored on this iPad.</div>
          <div class="demohint">DEMO ONLY - the PIN is 1234<small>${apvMode === "sent" ? esc(pinOwner()) + " can approve this" : "Any adult can approve this"}</small></div></div>
        <div class="veil a" data-act="veil-answer"></div><div class="veil o"></div><div class="veil c" data-act="card-close"></div>
        <div class="dcard" data-label="${cl.label}" data-n="${(cl.html.match(/<article/g)||[]).length}">${cl.html}<div class="dc-act"><button class="wc-b soft" data-act="card-close">${cl.label}</button></div></div>
        <div class="card answer"><div class="q">${ic("mic")}You asked: ${D.answer.q}</div>
          <div class="hand ${mic === "working" ? "go" : "done"}">${mic === "working" ? '<span class="sp2"></span>' : ic("check")}<span>${mic === "working" ? `${CN} is checking with ${D.answer.specialist}...` : `${CN} checked with ${D.answer.specialist}`}</span></div>
          ${mic === "working" ? `<div class="skc ansk">${sk(620,30)}${sk(420,30)}</div>` : `<div class="a">${D.answer.a}</div>
          <div class="ft"><span>${ic("spark","")}</span><span style="margin-right:auto;margin-left:10px">Answered by ${CNthe}</span><button class="btn" data-act="dismiss">Done</button></div>`}</div>
        ${boot ? `<div class="card recon"><div class="wf spin"><span class="sp"></span></div><h2>Starting up</h2>
          <p>Connecting to your agents. This takes about a minute after the power comes back.</p><div class="ln"></div>
          <div class="fine">Nothing to do. This screen opens on its own.</div></div>` : `<div class="card recon dock"><div class="rh"><div class="wf">${ic("wifioff")}</div><div><h2>${S.offline ? S.offline.message : "Reconnecting"}</h2>
          <p>Wi-Fi dropped. This display comes back on its own. Showing what it knew at 3:08 PM.</p></div></div>
          ${queue.length ? `<div class="qi">${ic("outbox")}<div class="qt"><div class="qq">${queue[0].q}</div><div class="qs">Saved - ${CN} will send this when we reconnect</div></div><b class="qn">${queue.length} waiting</b></div>` : ""}</div>`}
      </div>`;
    if (screen==="namevoice") {
      const g = app.querySelector(".vgrid");
      if (g) {
        if (scrollVoiceIntoView) {
          const sel = g.querySelector(".vcard.sel");
          if (sel) { const gap = 12; g.scrollTop = Math.max(0, sel.offsetTop - sel.offsetHeight - gap - 4); }
          scrollVoiceIntoView = false;
        } else { g.scrollTop = vScroll; }
      }
    }
    afterRender();
  }
  function rerender() { const g = app.querySelector(".vgrid"); if (g) vScroll = g.scrollTop; render(); }
  function afterRender() { if (window.__demoAfterRender) window.__demoAfterRender(); }

  /* ---------- demo state helpers ---------- */
  let revealTimer, micTimer, playTimer, tickTimer, toastTimer;
  const persist = () => store.set({ name: nameRaw, voice: voiceSel, speed: voiceSpeed, approvals: apvMode });
  const overlayOpen = () => !!(pinMode || card || mic === "working" || mic === "answering" || menuOpen || tour.on || welcomeOpen);
  function tourEvent(name) { if (tour.on && TOUR[tour.i] && TOUR[tour.i].on === name) setTimeout(() => tourGo(tour.i + 1), 60); }
  function startReveal() { revealed = true; clearTimeout(revealTimer); const secs = S.budget.revealSeconds || 20; revealUntil = Date.now() + secs * 1000;
    revealTimer = setTimeout(() => { revealed = false; revealUntil = 0; render(); }, secs * 1000); }
  function stopReveal() { revealed = false; clearTimeout(revealTimer); revealUntil = 0; }
  function openPin(mode, o) { pinMode = mode; pinBuf = ""; pinErr = ""; pinBusy = false; pend = o || null; if (card) { returnCard = card; card = null; } render(); tourEvent("pin-open"); }
  function cancelPin() { pinMode = null; pinBuf = ""; pinErr = ""; pinBusy = false; pend = null; if (returnCard) { card = returnCard; returnCard = null; } render(); }
  function applyApproval(id, action) {
    const a = apprList.find(x => x.id === id); if (!a) return;
    apprList = apprList.filter(x => x.id !== id);
    card = { kind: "result", outcome: action === "decline" ? "declined" : "approved", item: a.item };
  }
  function enterSettings() { snap = { name: nameRaw, voice: voiceSel, speed: voiceSpeed, apv: apvMode }; screen = "namevoice"; scrollVoiceIntoView = true; kbNum = false; kbShift = !nameRaw.length || /\s$/.test(nameRaw); }
  function closeSettings(revert) { if (revert && snap) { setName(snap.name); voiceSel = snap.voice; voiceSpeed = snap.speed; apvMode = snap.apv; persist(); } snap = null; clearTimeout(playTimer); voicePlaying = ""; screen = order[0]; }
  function okPin() {
    const m = pinMode, pe = pend; pinMode = null; pinBuf = ""; pinErr = ""; pinBusy = false; pend = null;
    if (m === "approve" && pe) applyApproval(pe.id, pe.action);
    if (m === "budget") { startReveal(); if (returnCard) { card = returnCard; } returnCard = null; }
    if (m === "settings") { enterSettings(); }
    if (m !== "budget") returnCard = null;
    render(); tourEvent("pin-ok"); if (m === "settings") tourEvent("settings-open");
  }
  function pinKey(k) {
    if (pinBusy) return;
    if (k === "Cancel") { cancelPin(); return; }
    if (k === "Delete") { pinBuf = pinBuf.slice(0, -1); pinErr = ""; }
    else if (/^\d$/.test(k) && pinBuf.length < PIN_LEN) { pinBuf += k; pinErr = ""; }
    render();
    if (pinBuf.length === PIN_LEN) {
      pinBusy = true;
      setTimeout(() => { if (!pinMode) return; if (pinBuf === DEMO_PIN) okPin(); else { pinErr = "That PIN did not match. Try again."; pinBuf = ""; pinBusy = false; render(); } }, 220);
    }
  }
  /* name keyboard */
  function typeChar(ch) {
    if (nameRaw.length >= NAME_MAX) return;
    setName(nameRaw + ch); kbShift = !kbNum && /\s$/.test(nameRaw); persist(); rerender();
  }
  function delChar() { setName(nameRaw.slice(0, -1)); kbShift = !nameRaw.length || /\s$/.test(nameRaw); persist(); rerender(); }
  function micTap() {
    if (boot || pinMode || card) return;
    clearTimeout(micTimer);
    if (offline) { if (mic === "idle") mic = "listening"; else { mic = "idle"; queue.push({ q: D.queued[0].q }); } render(); return; }
    if (mic === "idle") { mic = "listening"; render(); tourEvent("mic-listening"); micTimer = setTimeout(() => { if (mic === "listening") micSend(); }, 6000); return; }
    if (mic === "listening") { micSend(); return; }
    if (mic === "answering") { mic = "idle"; render(); tourEvent("answer-done"); }
  }
  function micSend() { clearTimeout(micTimer); mic = "working"; render(); tourEvent("mic-working"); micTimer = setTimeout(() => { if (mic === "working") { mic = "answering"; render(); } }, 2200); }
  function micDismiss() { clearTimeout(micTimer); const was = mic; mic = "idle"; render(); if (was === "answering") tourEvent("answer-done"); }
  function openCard(kind, extra) { clearTimeout(micTimer); if (mic !== "idle") mic = "idle"; card = Object.assign({ kind }, extra || {}); render(); }
  function closeCard() { const k = card && card.kind; card = null; render(); tourEvent("card-close"); if (k === "result") tourEvent("result-close"); }
  function goScreen(s) { card = null; pinMode = null; pend = null; returnCard = null; mic = "idle"; clearTimeout(micTimer); if (quietOn) { quietOn = false; } if (s !== "namevoice") snap = null; screen = s; if (s === "namevoice" && !snap) enterSettings(); render(); }
  function toast(msg) { let el = layer.querySelector(".dm-toast"); if (!el) { el = document.createElement("div"); el.className = "dm-toast"; layer.appendChild(el); } el.textContent = msg; el.classList.add("on"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("on"), 2600); }

  /* ---------- clicks inside the display ---------- */
  app.addEventListener("click", e => {
    const t = e.target;
    if (screen === "night") { screen = quietOn && prevScreen ? prevScreen : order[0]; quietOn = false; render(); tourEvent("wake"); return; }
    const key = t.closest("[data-k]");
    if (key && pinMode) { pinKey(key.dataset.k); return; }
    const kk = t.closest("[data-kk],[data-kka]");
    if (kk && screen === "namevoice") {
      const a = kk.dataset.kka;
      if (a === "shift") { if (!kbNum) { kbShift = !kbShift; rerender(); } }
      else if (a === "num") { kbNum = !kbNum; rerender(); }
      else if (a === "del") delChar();
      else if (a === "done") { rerender(); }
      else typeChar(kk.dataset.kk);
      return;
    }
    if (t.closest("#mic")) { micTap(); return; }
    const actEl = t.closest("[data-act]"), act = actEl && actEl.dataset.act;
    if (act === "veil-answer") { if (mic === "answering") micDismiss(); return; }
    if (act === "card-close") { closeCard(); return; }
    if (act === "dismiss") { micDismiss(); return; }
    if (act === "approve" || act === "decline") {
      const row = t.closest(".ai"); const id = actEl.dataset.id || (row && row.dataset.id);
      openPin("approve", { id, action: act }); return;
    }
    if (act === "agent") {
      const n = actEl.dataset.agent;
      openCard({ Calendar: "calendar", Shopper: "shopper", Budget: "budget", Inbox: "inbox", Concierge: "concierge" }[n]); tourEvent("agent-open"); return;
    }
    if (act === "card-reveal") { openPin("budget"); return; }
    if (act === "inbox-more") { toast("In the real wall this opens the Grok Bot app. Not available in the demo."); return; }
    if (act === "goto") { if (!pinMode && !card) { goScreen(actEl.dataset.s); } return; }
    if (act === "hold") { held = !held; render(); return; }
    if (act === "open-pin-budget") { openPin("budget"); return; }
    if (act === "open-pin-settings") { openPin("settings"); return; }
    if (act === "close-settings") { closeSettings(true); render(); tourEvent("settings-close"); return; }
    if (act === "save-settings") { closeSettings(false); render(); tourEvent("settings-close"); return; }
    if (act === "vfilt") { const g = app.querySelector(".vgrid"); if (g) vScroll = 0; voiceFilt = actEl.dataset.f || "all"; scrollVoiceIntoView = true; render(); return; }
    if (act === "play") {
      const g = app.querySelector(".vgrid"); if (g) vScroll = g.scrollTop;
      const v = actEl.dataset.v; clearTimeout(playTimer);
      voicePlaying = (voicePlaying === v) ? "" : v;
      if (voicePlaying) playTimer = setTimeout(() => { voicePlaying = ""; rerender(); }, 3200);
      render(); return;
    }
    if (act === "apv") { const g = app.querySelector(".vgrid"); if (g) vScroll = g.scrollTop; apvMode = actEl.dataset.v === "sent" ? "sent" : "any"; persist(); render(); return; }
    if (act === "speed") return;
    const vc = t.closest("[data-voice]");
    if (vc) { const g = app.querySelector(".vgrid"); if (g) vScroll = g.scrollTop; voiceSel = vc.dataset.voice; persist(); render(); return; }
    if (t.closest(".vspeed") || t.closest(".vfilt") || t.closest(".vgrid") || t.closest(".nvl") || t.closest(".nvact")) return;
    if (act === "toggle-amt") {
      if (!revealed) { openPin("budget"); return; }
      stopReveal(); render(); return;
    }
    const over = t.closest(".ai.over");
    if (over && !t.closest(".b")) { openCard("phone", { who: (apprList.find(x => x.id === over.dataset.id) || {}).who }); return; }
    const wc = t.closest(".dcard .wc-note");
    if (wc && revealed && card && card.kind === "budget") { stopReveal(); render(); return; }
  });
  app.addEventListener("input", e => {
    const el = e.target.closest("[data-act=speed]");
    if (!el) return;
    voiceSpeed = clampSpeed(el.value);
    const lab = app.querySelector(".vsv");
    if (lab) lab.textContent = voiceSpeed.toFixed(1);
    el.setAttribute("aria-label", "Speaking speed, " + voiceSpeed.toFixed(1));
    persist();
  });
  document.addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (welcomeOpen) return;
    if (pinMode) { if (/^\d$/.test(e.key)) pinKey(e.key); else if (e.key === "Backspace") pinKey("Delete"); else if (e.key === "Escape") pinKey("Cancel"); return; }
    if (screen === "namevoice" && !menuOpen) {
      if (e.key === "Backspace") { delChar(); e.preventDefault(); return; }
      if (e.key.length === 1) { typeChar(e.key); e.preventDefault(); return; }
    }
    if (e.key === "m" || e.key === "M") { toggleMenu(); return; }
    if (e.key === "Escape" && menuOpen) { toggleMenu(false); return; }
    if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && !pinMode && !card && screen !== "night") { const i = order.indexOf(screen); goScreen(order[(i + (e.key === "ArrowRight" ? 1 : -1) + order.length) % order.length]); }
  });

  /* ================= demo layer: orientation, menu, welcome, tour ================= */
  const mqP = window.matchMedia("(orientation: portrait)");
  let orientMode = "follow", menuOpen = false, welcomeOpen = false;
  const tour = { on: false, i: 0 };

  /* Orientation follows the device live (resize, orientationchange, matchMedia). No reload, no state loss. */
  function applyOrient() {
    const dev = mqP.matches ? "portrait" : "landscape";
    const o = orientMode === "follow" ? dev : orientMode;
    root.setAttribute("data-orient", o); root.setAttribute("data-device-orient", dev);
    const cw = o === "portrait" ? 1000 : 1440, ch = o === "portrait" ? 1440 : 1000;
    const framed = o !== dev;
    root.setAttribute("data-frame", framed ? "1" : "0");
    let fw, fh;
    if (framed) {
      const W = window.innerWidth, H = window.innerHeight, s = Math.min(W / cw, H / ch);
      fw = cw * s; fh = ch * s;
      Object.assign(app.style, { left: (W - fw) / 2 + "px", top: (H - fh) / 2 + "px", width: fw + "px", height: fh + "px", right: "auto", bottom: "auto" });
    } else {
      Object.assign(app.style, { left: "", top: "", width: "", height: "", right: "", bottom: "" });
      fw = app.clientWidth; fh = app.clientHeight;
    }
    root.style.setProperty("--u", Math.min(fw / cw, fh / ch) + "px");
    tourPosition(); menuPosition();
  }
  let orientTimer;
  function onViewport() { applyOrient(); clearTimeout(orientTimer); orientTimer = setTimeout(applyOrient, 120); setTimeout(applyOrient, 400); }
  window.addEventListener("resize", onViewport);
  window.addEventListener("orientationchange", onViewport);
  if (mqP.addEventListener) mqP.addEventListener("change", onViewport); else if (mqP.addListener) mqP.addListener(onViewport);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", onViewport);

  /* ---------- demo menu ---------- */
  const el = (cls, html) => { const d = document.createElement("div"); d.className = cls; if (html != null) d.innerHTML = html; return d; };
  const hot = document.createElement("button"); hot.id = "dm-hot"; hot.setAttribute("aria-label", "Demo menu"); hot.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>';
  layer.appendChild(hot);
  const menuEl = el("dm-menu"); menuEl.setAttribute("role", "dialog"); menuEl.setAttribute("aria-label", "Demo menu, demo only");
  layer.appendChild(menuEl);
  const seg = (name, opts, cur) => `<div class="dm-seg" data-g="${name}">${opts.map(([v, l]) => `<button data-m="${name}:${v}" class="${cur === v ? "on" : ""}">${l}</button>`).join("")}</div>`;
  function menuHtml() {
    const th = theme === "dark" ? "dark" : "light";
    const net = boot ? "boot" : offline ? "offline" : "online";
    return `<div class="dm-head"><div><div class="dm-badge">DEMO ONLY</div><div class="dm-title">Demo menu</div><div class="dm-sub">Not part of the wall display. Example data, no real accounts.</div></div><button class="dm-x" data-m="close" aria-label="Close demo menu">&times;</button></div>
      <button class="dm-big" data-m="tour">${tour.on ? "Restart the guided tour" : "Start the guided tour"}</button>
      <div class="dm-row"><span>Theme</span>${seg("theme", [["light","Light"],["dark","Dark"]], th)}</div>
      <div class="dm-row"><span>Quiet hours</span>${seg("quiet", [["off","Off"],["on","On"]], quietOn ? "on" : "off")}</div>
      <div class="dm-row"><span>Connection</span>${seg("net", [["online","Online"],["offline","Reconnecting"],["boot","Starting up"]], net)}</div>
      <div class="dm-row"><span>Layout</span>${seg("orient", [["follow","Follow device"],["landscape","Landscape"],["portrait","Portrait"]], orientMode)}</div>
      <div class="dm-note">Follow device switches live when the iPad turns. Landscape and Portrait are overrides for testing on a desktop.</div>
      <div class="dm-row"><span>Budget</span>${seg("budget", [["ok","On track"],["over","Over"]], budgetOver ? "over" : "ok")}</div>
      <div class="dm-row"><span>Jump to</span><div class="dm-seg wrap">${[["today","Today"],["deliveries","Deliveries"],["budget","Budget"],["slideshow","Photos"],["namevoice","Name and voice"],["micspec","Mic states"]].map(([v, l]) => `<button data-m="go:${v}" class="${screen === v ? "on" : ""}">${l}</button>`).join("")}</div></div>
      <div class="dm-foot"><button class="dm-reset" data-m="reset">Reset demo</button><span>Demo PIN: 1234</span></div>`;
  }
  function menuRender() { if (menuOpen) menuEl.innerHTML = menuHtml(); }
  function menuPosition() { /* the panel is sized in CSS from --u and clamps to the viewport */ }
  function toggleMenu(force) {
    menuOpen = force == null ? !menuOpen : force;
    layer.setAttribute("data-menu", menuOpen ? "1" : "0");
    if (menuOpen) menuEl.innerHTML = menuHtml();
    tourPosition();
  }
  hot.addEventListener("click", () => toggleMenu());
  /* long press on the clock opens it too */
  let lp = null;
  document.addEventListener("pointerdown", e => { if (!e.target.closest(".clock")) return; lp = { x: e.clientX, y: e.clientY, t: setTimeout(() => { lp = null; toggleMenu(true); }, 700) }; });
  const lpEnd = () => { if (lp) { clearTimeout(lp.t); lp = null; } };
  document.addEventListener("pointerup", lpEnd); document.addEventListener("pointercancel", lpEnd);
  document.addEventListener("pointermove", e => { if (lp && Math.hypot(e.clientX - lp.x, e.clientY - lp.y) > 12) lpEnd(); });

  function setNet(v) {
    boot = v === "boot"; offline = v !== "online"; queue = (offline && !boot) ? D.queued.slice() : [];
    mic = "idle"; clearTimeout(micTimer); if (boot) { card = null; pinMode = null; if (screen !== "today") screen = "today"; } render();
  }
  function setQuiet(on) {
    if (on === quietOn) return;
    quietOn = on; card = null; pinMode = null; pend = null; mic = "idle";
    if (on) { prevScreen = screen; screen = "night"; } else { screen = (prevScreen && prevScreen !== "night") ? prevScreen : order[0]; }
    render();
  }
  function resetDemo() {
    store.clear(); setName("Concierge"); voiceSel = DEFAULT_VOICE; voiceSpeed = SPEED_DEF; apvMode = "any"; voiceFilt = "all"; voicePlaying = ""; scrollVoiceIntoView = true;
    clearTimeout(revealTimer); clearTimeout(micTimer); clearTimeout(playTimer);
    revealed = false; revealUntil = 0; apprList = D.approvals.map(a => Object.assign({}, a)); budgetOver = false;
    card = null; returnCard = null; pinMode = null; pend = null; pinBuf = ""; pinErr = ""; mic = "idle"; boot = false; offline = false; queue = []; quietOn = false; prevScreen = null;
    theme = S.theme; screen = order[0]; snap = null; held = true; orientMode = "follow";
    endTour(); applyOrient(); render();
  }
  menuEl.addEventListener("click", e => {
    const b = e.target.closest("[data-m]"); if (!b) return; e.stopPropagation();
    const [k, v] = b.dataset.m.split(":");
    if (k === "close") { toggleMenu(false); return; }
    if (k === "tour") { toggleMenu(false); startTour(); return; }
    if (k === "theme") { theme = v; render(); }
    else if (k === "quiet") setQuiet(v === "on");
    else if (k === "net") setNet(v);
    else if (k === "orient") { orientMode = v; applyOrient(); }
    else if (k === "budget") { budgetOver = v === "over"; render(); }
    else if (k === "go") { quietOn = false; goScreen(v); }
    else if (k === "reset") { resetDemo(); toggleMenu(false); toast("Demo reset"); return; }
    menuRender();
  });
  layer.addEventListener("click", e => { if (menuOpen && !e.target.closest(".dm-menu") && !e.target.closest("#dm-hot")) toggleMenu(false); });

  /* ---------- welcome ---------- */
  const welcomeEl = el("dm-welcome"); layer.appendChild(welcomeEl);
  function showWelcome(on) {
    welcomeOpen = on; layer.setAttribute("data-welcome", on ? "1" : "0");
    if (on) welcomeEl.innerHTML = `<div class="dm-wcard"><div class="dm-badge">DEMO ONLY</div><h1>Family wall display</h1>
      <p>A tap-through demo of the screens on the wall. Everything is example data. No real accounts, nothing is sent.</p>
      <div class="dm-wact"><button class="dm-big" data-w="start">Start demo</button><button class="dm-alt" data-w="free">Explore on my own</button></div>
      <p class="dm-fine">Demo PIN: 1234. The faint dots in the top right corner open the demo menu.</p></div>`;
  }
  welcomeEl.addEventListener("click", e => { const b = e.target.closest("[data-w]"); if (!b) return; showWelcome(false); if (b.dataset.w === "start") startTour(); });

  /* ---------- guided tour ---------- */
  const bare = () => { clearTimeout(micTimer); card = null; returnCard = null; pinMode = null; pend = null; pinBuf = ""; pinErr = ""; pinBusy = false; mic = "idle"; if (quietOn) { quietOn = false; } if (boot || offline) { boot = false; offline = false; queue = []; } snap = snap; };
  const toToday = () => { bare(); screen = "today"; render(); };
  const ensureAppr = id => { if (!apprList.find(x => x.id === id)) { apprList = D.approvals.map(a => Object.assign({}, a)); } };
  const TOUR = [
    { center: true, title: "Welcome", text: "This is the family wall display, with example data only. Nothing is real and nothing is sent. This tour shows you what to tap. You can leave it any time.", next: "Start", setup: () => { toToday(); } },
    { target: ".members", title: "Today at a glance", text: "Everyone's day in one place, with what is next highlighted. It stays up all day.", setup: toToday },
    { target: '.ag[data-agent="Calendar"]', title: "Tap an agent", text: "Specialist agents report here. Tap Calendar to open its card. Shopper, Budget and Inbox work the same way.", on: "agent-open", setup: toToday },
    { target: ".dcard", title: "A card from an agent", text: "Cards always arrive through the concierge, the only thing the family talks to. Tap Done to close it.", on: "card-close", setup: () => { if (!card) { bare(); screen = "today"; openCard("calendar"); } } },
    { target: "#mic", title: "Ask the concierge", text: "Tap the mic. In this demo it hears a scripted question about the rain jackets.", on: "mic-listening", setup: toToday },
    { target: "#mic", title: "Listening", text: "Tap the mic again to send. It also sends by itself after a few seconds.", on: "mic-working", setup: () => { if (mic !== "listening") { bare(); screen = "today"; mic = "listening"; render(); } } },
    { target: ".answer", title: "The answer", text: "The concierge checks with a specialist, then answers out loud and on a card. Tap Done.", on: "answer-done", setup: () => { if (mic === "listening") { micSend(); } else if (mic === "idle") { bare(); screen = "today"; mic = "working"; render(); micTimer = setTimeout(() => { if (mic === "working") { mic = "answering"; render(); } }, 1500); } } },
    { target: '.appr [data-act="approve"]', title: "Approvals", text: "Requests from the family's phones wait here. Tap Approve on the water filters.", on: "pin-open", setup: () => { toToday(); ensureAppr("water"); render(); } },
    { target: ".pinpad", title: "Enter the PIN", text: "Approving needs an adult PIN. The demo PIN is 1234. Any other PIN is rejected, so try a wrong one first if you like.", on: "pin-ok", setup: () => { if (!pinMode) { toToday(); ensureAppr("water"); openPin("approve", { id: "water", action: "approve" }); } } },
    { target: ".dcard", title: "Approved", text: "The wall confirms it, and the Shopper agent places the order. Tap Done.", on: "result-close", setup: () => { if (!(card && card.kind === "result")) { toToday(); ensureAppr("water"); applyApproval("water", "approve"); render(); } } },
    { target: ".appr .ai.over", title: "Bigger purchases", text: "Anything over $150 has no Approve button on the wall. It says to approve on the phone. Decline still works with the PIN.", setup: () => { toToday(); ensureAppr("dishwasher"); render(); } },
    { target: ".bhero", title: "Budget, status only", text: "Amounts stay hidden by default. The wall only says On track or Over. The demo menu can flip it to Over.", setup: () => { bare(); stopReveal(); screen = "budget"; render(); } },
    { target: ".reveal2", title: "Show the amounts", text: "Tap the PIN button to show amounts.", on: "pin-open", setup: () => { bare(); stopReveal(); screen = "budget"; render(); } },
    { target: ".pinpad", title: "Enter the PIN", text: "Same demo PIN: 1234.", on: "pin-ok", setup: () => { if (!pinMode) { bare(); screen = "budget"; stopReveal(); openPin("budget"); } } },
    { target: ".bhero", title: "Amounts, for 20 seconds", text: "The amounts hide again by themselves after 20 seconds, or when you tap.", setup: () => { bare(); screen = "budget"; startReveal(); render(); } },
    { target: ".night .ncenter", title: "Quiet hours", text: "At night the wall dims to a clock only. Touch the screen to wake it.", on: "wake", setup: () => { bare(); stopReveal(); screen = "today"; quietOn = false; setQuiet(true); } },
    { target: ".recon", title: "If Wi-Fi drops", text: "The wall says so, keeps what it knew, saves what you ask, and pauses approvals until it reconnects.", setup: () => { bare(); setQuiet(false); screen = "today"; offline = true; queue = D.queued.slice(); render(); } },
    { target: ".gear", title: "Settings", text: "Settings need an adult PIN too. Tap the gear.", on: "pin-open", setup: () => { bare(); setQuiet(false); screen = "today"; render(); } },
    { target: ".pinpad", title: "Enter the PIN", text: "Demo PIN: 1234.", on: "settings-open", setup: () => { if (!pinMode) { bare(); screen = "today"; openPin("settings"); } } },
    { target: ".nvl", title: "Rename the concierge", text: "Type a name on the keyboard, up to 14 characters. It changes on every screen, and this demo remembers it on this iPad.", setup: () => { bare(); if (screen !== "namevoice") { enterSettings(); } render(); } },
    { target: ".nvr", title: "Pick a voice", text: "28 voices, with Eve as the default. Move the speed slider, or tap Play sample. In the demo it only shows the playing state, with no sound.", setup: () => { bare(); if (screen !== "namevoice") { enterSettings(); } render(); } },
    { target: ".nvact", title: "Save", text: "Tap Save changes to go back to the wall.", on: "settings-close", setup: () => { bare(); if (screen !== "namevoice") { enterSettings(); } render(); } },
    { center: true, title: "That is the tour", text: "Explore freely. For light and dark, quiet hours, offline, layout, jumping to any screen, or a reset, tap the faint dots in the top right corner, or press and hold the clock.", next: "Finish", setup: () => { bare(); screen = "today"; render(); } }
  ];
  const tourEl = el("dm-tour"); layer.appendChild(tourEl);
  tourEl.innerHTML = `<div class="dt-b dt-t"></div><div class="dt-b dt-l"></div><div class="dt-b dt-r"></div><div class="dt-b dt-d"></div><div class="dt-ring"></div><div class="dt-bubble" role="dialog" aria-live="polite"></div>`;
  const dtRing = tourEl.querySelector(".dt-ring"), dtBub = tourEl.querySelector(".dt-bubble");
  const blk = { t: tourEl.querySelector(".dt-t"), l: tourEl.querySelector(".dt-l"), r: tourEl.querySelector(".dt-r"), d: tourEl.querySelector(".dt-d") };
  function startTour() { tour.on = true; root.setAttribute("data-tour", "1"); layer.setAttribute("data-tour", "1"); tourGo(0); }
  function endTour() { tour.on = false; root.setAttribute("data-tour", "0"); tour.i = 0; layer.setAttribute("data-tour", "0"); }
  function tourGo(i) {
    if (!tour.on) return;
    if (i >= TOUR.length) { endTour(); toToday(); return; }
    if (i < 0) i = 0;
    tour.i = i; const s = TOUR[i];
    if (s.setup) s.setup();
    renderBubble();
    tourPosition();
    setTimeout(tourPosition, 80);
  }
  function renderBubble() {
    const s = TOUR[tour.i], n = TOUR.length, last = tour.i === n - 1;
    const nextLbl = s.next || (s.on ? "Skip this step" : "Next");
    dtBub.innerHTML = `<div class="dt-step">Step ${tour.i + 1} of ${n}</div><div class="dt-title">${esc(s.title)}</div><div class="dt-text">${esc(s.text)}</div>
      <div class="dt-act">${tour.i > 0 && !last ? '<button class="dt-back" data-t="back">Back</button>' : ""}<button class="dt-next" data-t="next">${nextLbl}</button>${last ? "" : '<button class="dt-exit" data-t="exit">Exit tour</button>'}</div>`;
  }
  tourEl.addEventListener("click", e => {
    const b = e.target.closest("[data-t]");
    if (!b) { if (e.target.closest(".dt-b")) { dtRing.classList.remove("nudge"); void dtRing.offsetWidth; dtRing.classList.add("nudge"); } return; }
    if (b.dataset.t === "next") tourGo(tour.i + 1);
    else if (b.dataset.t === "back") tourGo(tour.i - 1);
    else if (b.dataset.t === "exit") endTour();
  });
  function tourPosition() {
    if (!tour.on) return;
    const s = TOUR[tour.i], W = window.innerWidth, H = window.innerHeight;
    let tg = s.target ? document.querySelector(s.target) : null, r = null;
    if (tg) { const b = tg.getBoundingClientRect(); if (b.width > 2 && b.height > 2) r = { l: b.left, t: b.top, w: b.width, h: b.height }; }
    const pad = 10;
    if (r) {
      const L = Math.max(4, r.l - pad), T = Math.max(4, r.t - pad), R2 = Math.min(W - 4, r.l + r.w + pad), B2 = Math.min(H - 4, r.t + r.h + pad);
      Object.assign(dtRing.style, { display: "block", left: L + "px", top: T + "px", width: R2 - L + "px", height: B2 - T + "px" });
      Object.assign(blk.t.style, { left: 0, top: 0, width: W + "px", height: T + "px" });
      Object.assign(blk.d.style, { left: 0, top: B2 + "px", width: W + "px", height: Math.max(0, H - B2) + "px" });
      Object.assign(blk.l.style, { left: 0, top: T + "px", width: L + "px", height: B2 - T + "px" });
      Object.assign(blk.r.style, { left: R2 + "px", top: T + "px", width: Math.max(0, W - R2) + "px", height: B2 - T + "px" });
      tourEl.classList.remove("nohole");
      placeBubble({ l: L, t: T, r: R2, b: B2 });
    } else {
      dtRing.style.display = "none"; tourEl.classList.add("nohole");
      Object.assign(blk.t.style, { left: 0, top: 0, width: W + "px", height: H + "px" });
      ["d", "l", "r"].forEach(k => Object.assign(blk[k].style, { width: 0, height: 0 }));
      placeBubble(null);
    }
  }
  function placeBubble(hole) {
    const W = window.innerWidth, H = window.innerHeight, m = 12, g = 16;
    const clamp = (v, a, b) => Math.max(a, Math.min(v, b));
    dtBub.style.minWidth = "0"; dtBub.style.width = ""; dtBub.style.left = "0px"; dtBub.style.top = "0px";
    const bw0 = Math.min(dtBub.offsetWidth || 380, W - 2 * m);
    const size = wd => { dtBub.style.width = wd + "px"; return dtBub.offsetHeight; };
    if (!hole) { const h = size(bw0); dtBub.style.left = (W - bw0) / 2 + "px"; dtBub.style.top = (H - h) / 2 + "px"; return; }
    const cx = (hole.l + hole.r) / 2, cy = (hole.t + hole.b) / 2, cands = [];
    let h = size(bw0);
    cands.push({ w: bw0, h, l: clamp(cx - bw0 / 2, m, W - bw0 - m), t: hole.b + g });
    cands.push({ w: bw0, h, l: clamp(cx - bw0 / 2, m, W - bw0 - m), t: hole.t - g - h });
    const ar = W - m - (hole.r + g), al = hole.l - g - m;
    if (ar >= 240) { const w = Math.min(bw0, ar); h = size(w); cands.push({ w, h, l: hole.r + g, t: clamp(cy - h / 2, m, H - h - m) }); }
    if (al >= 240) { const w = Math.min(bw0, al); h = size(w); cands.push({ w, h, l: hole.l - g - w, t: clamp(cy - h / 2, m, H - h - m) }); }
    h = size(bw0);
    cands.push({ w: bw0, h, l: (W - bw0) / 2, t: H - h - m }, { w: bw0, h, l: (W - bw0) / 2, t: m });
    let best = null, bo = 1e12;
    for (const c of cands) {
      const fits = c.l >= m - 1 && c.t >= m - 1 && c.l + c.w <= W - m + 1 && c.t + c.h <= H - m + 1;
      const ox = Math.max(0, Math.min(c.l + c.w, hole.r) - Math.max(c.l, hole.l)), oy = Math.max(0, Math.min(c.t + c.h, hole.b) - Math.max(c.t, hole.t));
      const ov = ox * oy + (fits ? 0 : 1e9);
      if (ov < bo) { bo = ov; best = c; if (ov === 0) break; }
    }
    size(best.w);
    dtBub.style.left = clamp(best.l, m, Math.max(m, W - best.w - m)) + "px"; dtBub.style.top = clamp(best.t, m, Math.max(m, H - best.h - m)) + "px";
  }
  window.__demoAfterRender = () => { tourPosition(); };
  setInterval(() => { if (tour.on) tourPosition(); }, 500);

  /* reveal countdown text */
  setInterval(() => {
    if (!revealed || !revealUntil) return;
    const s = Math.max(0, Math.ceil((revealUntil - Date.now()) / 1000)), txt = `Hides again in ${s} second${s === 1 ? "" : "s"}. Tap to hide now.`;
    app.querySelectorAll(".rv-note span, .dcard [data-card=budget_summary] .wc-note span").forEach(n => { n.textContent = txt; });
  }, 1000);

  window.__demo = { get state() { return { screen, theme, offline, boot, mic, pinMode, card: card && card.kind, quietOn, revealed, apprCount: apprList.length, name: nameRaw, voice: voiceSel, speed: voiceSpeed, orient: root.getAttribute("data-orient"), orientMode, tourOn: tour.on, tourStep: tour.i, menuOpen, welcomeOpen, budgetOver }; },
    tourGo: i => tourGo(i), startTour, endTour, TOUR_LEN: TOUR.length, setOrientMode: m => { orientMode = m; applyOrient(); }, toggleMenu, showWelcome, reset: resetDemo };

  /* ---------- init ---------- */
  applyOrient(); render();
  if (!STATIC) {
    let pr = 0, last = Date.now(), pt = 0;
    setInterval(() => {
      const dt = (Date.now()-last)/1000; last = Date.now();
      if (!held && !overlayOpen() && screen !== "night") { pt += dt; if (pt >= S.rotationSeconds) { pt = 0; screen = order[(order.indexOf(screen)+1)%order.length]; render(); }
        const b = app.querySelector(".dots i.on b"); if (b) b.style.setProperty("--p", (pt/S.rotationSeconds*100)+"%"); }
      if (screen==="slideshow") { const ph = app.querySelectorAll(".ph"); if (ph.length) { pr += dt; if (pr > S.slideshow.secondsPerPhoto) { pr = 0; ph[photoIdx].classList.remove("on"); photoIdx = (photoIdx+1)%ph.length; ph[photoIdx].classList.add("on"); } } }
    }, 250);
  }
  if (Q.get("welcome") !== "0" && !Q.get("screen") && !Q.get("pin") && !Q.get("mic")) showWelcome(true);
  window.__ready = true;
})();
