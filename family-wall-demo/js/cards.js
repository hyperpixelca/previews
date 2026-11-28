/* DRAFT (internal) - family wall CARD LIBRARY renderer. Plain JS, no build step, no dependencies.
   HYPXCards.render(card, ctx) -> HTML string for one card. Cards are plain data (see card-schemas.json).
   Bots never send HTML. Every string is escaped here. Only **bold** is allowed (answer card). */
(function (g) {
  const SPEC = { calendar: "Calendar", shopper: "Shopper", budget: "Budget", inbox_digest: "Inbox Digest", custom: "Custom" };
  const P = {
    check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>', lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    mic:'<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', trend:'<path d="M4 16l5-5 4 4 7-8"/>',
    wifioff:'<path d="M3 3l18 18M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 3.2-2M2 9.2a15 15 0 0 1 4.3-2.7M10.7 5.1A15 15 0 0 1 22 9.2M13.9 8.9A10 10 0 0 1 19 12.9"/><circle cx="12" cy="20" r=".8" fill="currentColor"/>',
    wifi:'<path d="M2 9.2a15 15 0 0 1 20 0M5 12.9a10 10 0 0 1 14 0M8.5 16.4a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r=".8" fill="currentColor"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 8l9 6 9-6"/>',
    outbox:'<path d="M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5"/>',
    pin:'<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    box:'<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
    bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/>',
    list:'<path d="M9 6h11M9 12h11M9 18h11M4 6h.1M4 12h.1M4 18h.1"/>',
    image:'<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M4 18l5.5-5 4 3.5 3-2.5 4 4"/>',
    alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.1"/>', arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    retry:'<path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5"/>', hand:'<path d="M12 3v9M8 6v8M16 6v8M5 11v3a7 7 0 0 0 14 0v-3"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
    cloud:'<path d="M7 18.5h10.2a4.1 4.1 0 0 0 .6-8.15A5.8 5.8 0 0 0 6.7 9.9 4.3 4.3 0 0 0 7 18.5z"/>',
    partly:'<path d="M8 3v1.6M3 5.1l1.1 1.1M13 5.1l-1.1 1.1M2 10h1.6"/><path d="M5.6 12.4a3.6 3.6 0 1 1 6.4-2.9"/><path d="M9.5 20h7.7a3.5 3.5 0 0 0 .5-6.95A4.9 4.9 0 0 0 9.1 13.6 3.2 3.2 0 0 0 9.5 20z"/>',
    rain:'<path d="M7 14.5h10.2a4 4 0 0 0 .6-7.95A5.8 5.8 0 0 0 6.7 6 4.3 4.3 0 0 0 7 14.5z"/><path d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5"/>',
    storm:'<path d="M7 14.5h10.2a4 4 0 0 0 .6-7.95A5.8 5.8 0 0 0 6.7 6 4.3 4.3 0 0 0 7 14.5z"/><path d="M12.5 15l-2.5 3.2h3.5l-2 3.3"/>',
    snow:'<path d="M7 14.5h10.2a4 4 0 0 0 .6-7.95A5.8 5.8 0 0 0 6.7 6 4.3 4.3 0 0 0 7 14.5z"/><path d="M8.5 18.5h.1M12 20.5h.1M15.5 18.5h.1M12 17.5h.1"/>',
    fog:'<path d="M4 8h16M3 12h14M6 16h14M4 20h10"/>', wind:'<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8"/>'
  };
  const ic = (n, c = "") => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
  const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rich = t => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  const money = n => "$" + (Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(2));
  const loc = s => { const m = String(s).match(/(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/); return { y: +m[1], mo: +m[2], d: +m[3], h: +(m[4] || 0), mi: +(m[5] || 0) }; };
  const ms = s => { const l = loc(s); return Date.UTC(l.y, l.mo - 1, l.d, l.h, l.mi); };
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const tm = s => { const l = loc(s); const ap = l.h >= 12 ? "PM" : "AM"; return `${l.h % 12 || 12}:${String(l.mi).padStart(2, "0")} ${ap}`; };
  const dayKey = s => { const l = loc(s); return Date.UTC(l.y, l.mo - 1, l.d) / 864e5; };
  const dlong = s => { const l = loc(s), w = WD[new Date(Date.UTC(l.y, l.mo - 1, l.d)).getUTCDay()]; return `${w}, ${MO[l.mo - 1]} ${l.d}`; };
  const day = (s, now) => { const k = dayKey(s) - dayKey(now); return k === 0 ? "Today" : k === 1 ? "Tomorrow" : dlong(s); };
  const dshort = s => { const l = loc(s); return WD[new Date(Date.UTC(l.y, l.mo - 1, l.d)).getUTCDay()]; };
  const dmd = s => { const l = loc(s); return `${MO[l.mo - 1]} ${l.d}`; };

  const R = {};
  const mem = (c, id) => c.members[id] || { name: id, initial: "?", color: "m1" };
  const av = (c, id, k = "") => { const m = mem(c, id); return `<span class="wc-av ${m.color} ${k}">${esc(m.initial)}</span>`; };
  const who = (c, id) => `<span class="wc-who">${av(c, id)}${esc(mem(c, id).name)}</span>`;
  const the = c => c.name === "Concierge" ? "the Concierge" : esc(c.name);

  /* handoff line: {name} checked with {Specialist}. State is set by the wall, never by the bot. */
  const hand = (c, via, state = "done", extra = "") => {
    const sp = SPEC[via] || "";
    const t = state === "go" ? `${esc(c.name)} is checking with ${sp}...` : state === "fail" ? `${esc(c.name)} could not reach ${sp}` : `${esc(c.name)} checked with ${sp}`;
    const lead = state === "go" ? '<span class="wc-sp"></span>' : state === "fail" ? ic("alert") : ic("check");
    return `<span class="wc-hand ${state === "go" ? "go" : state === "fail" ? "fail" : ""}">${lead}<span>${t}</span></span>`;
  };
  const foot = (c, card, o = {}) => {
    const via = card.via;
    const left = via && via !== "concierge" ? hand(c, via, o.hand || "done") : `<span class="fx">${ic("spark")}<span>${o.text || "From " + the(c)}</span></span>`;
    return `<div class="wc-f">${left}${o.meta ? `<span class="meta">${o.meta}</span>` : ""}</div>`;
  };
  const head = (icon, label, right = "", warn = false) => `<div class="wc-h"><span class="wc-eb ${warn ? "warn" : ""}">${ic(icon)}<span>${esc(label)}</span></span>${right}</div>`;
  const wrap = (type, cls, inner, extra = "") => `<article class="wc ${cls}" data-card="${type}" ${extra}>${inner}</article>`;

  /* ---------------- calendar ---------------- */
  R.calendar_next_up = (card, c) => { const d = card.data, m = mem(c, d.member), mins = Math.max(0, Math.round((ms(d.start) - ms(c.now)) / 60000));
    const cd = mins >= 120 ? `${Math.floor(mins / 60)}<small>h</small>` : mins >= 60 ? `1<small>h</small> ${mins - 60}<small>min</small>` : `${mins}<small>min</small>`;
    return wrap("calendar_next_up", "wc-hero", `<div class="top">${av(c, d.member)}<div><div class="wc-eb">Next up</div><h2>${esc(d.title)}</h2>
      <div class="meta"><b>${esc(m.name)}</b> &nbsp;&middot;&nbsp; ${tm(d.start)}${d.place ? " &nbsp;&middot;&nbsp; " + esc(d.place) : ""}</div></div></div>
      <div class="cd"><span class="wc-eb">Starts in</span><div class="big">${cd}</div></div>${foot(c, card)}`); };
  R.calendar_event = (card, c) => { const d = card.data, conflict = d.status === "conflict";
    return wrap("calendar_event", "", `${head("calendar", "Event", `<span class="wc-chip ${conflict ? "warn" : "ok"}">${conflict ? "Overlaps" : "On the calendar"}</span>`)}
      <div class="wc-body"><div class="wc-t">${esc(d.title)}</div>
      <div class="wc-when"><span class="wc-s">${tm(d.start)} to ${tm(d.end)}</span><span class="wc-n">${day(d.start, c.now)}</span></div>
      ${d.place ? `<div class="wc-line">${ic("pin")}${esc(d.place)}</div>` : ""}</div>
      ${conflict ? `<div class="wc-conf">${ic("alert")}<span>Overlaps with ${esc(d.conflict_with)}</span></div>` : ""}
      <div class="wc-people"><div class="wc-stack">${d.members.map(i => av(c, i)).join("")}</div><span>${d.members.map(i => esc(mem(c, i).name)).join(", ")}</span></div>
      ${d.note ? `<div class="wc-n">${esc(d.note)}</div>` : ""}${foot(c, card)}`); };

  /* ---------------- shopper ---------------- */
  R.shopper_tracking = (card, c) => { const d = card.data, S4 = ["Ordered", "Shipped", "Out for delivery", "Delivered"];
    return wrap("shopper_tracking", d.step === 3 ? "wc-hot" : "", `<div class="wc-h"><span class="wc-shop">${esc(d.shop)}</span>${who(c, d.member)}</div>
      <div class="wc-body"><div class="wc-t">${esc(d.item)}</div><div class="wc-s">${esc(d.eta)}</div>
      <div class="wc-steps">${[1, 2, 3, 4].map(n => `<i class="${n < d.step ? "on" : n === d.step ? "now" : ""}"></i>`).join("")}</div>
      <div class="wc-n sm">${S4[d.step - 1]} &nbsp;&middot;&nbsp; ${esc(d.note)}</div></div>${foot(c, card, { meta: "Checked " + tm(card.created_at) })}`); };
  R.shopper_reorder = (card, c) => { const d = card.data, over = d.price > c.limit;
    return wrap("shopper_reorder", "", `${head("box", "Reorder suggestion", who(c, d.member))}
      <div class="wc-body"><div class="wc-row"><div class="wc-t">${esc(d.item)}</div><div class="wc-price">${money(d.price)}</div></div>
      <div class="wc-line">${esc(d.shop)} &nbsp;&middot;&nbsp; last bought ${dmd(d.last_bought)}</div><div class="wc-n">${esc(d.reason)}</div></div>
      <div class="wc-act"><button class="wc-b pri">${over ? "Send to phone" : "Send for approval"}</button><button class="wc-b">Not now</button></div>
      <div class="wc-note ${over ? "warn" : ""}">${ic(over ? "phone" : "lock")}<span>${over ? `Over ${money(c.limit)} - approval happens on your phone` : "Nothing is bought until an adult approves."}</span></div>${foot(c, card)}`); };

  /* ---------------- budget (amounts only exist after an adult PIN) ---------------- */
  R.budget_summary = (card, c) => { const d = card.data, a = d.amounts, over = d.overall === "over";
    const rows = d.categories.map(k => { const o = k.status === "over"; const am = a && a.categories && a.categories.find(x => x.name === k.name);
      return `<div class="wc-brow"><div class="r1"><div class="cn">${esc(k.name)}</div>
        ${am ? `<div class="cv">${money(am.spent)} <em>of ${money(am.plan)}</em></div>` : ""}
        <span class="wc-status ${o ? "warn" : ""}">${ic(o ? "alert" : "check")}${o ? "Over" : "On track"}</span></div>
        ${am ? `<div class="wc-bar ${o ? "over" : ""}"><b style="width:${Math.min(am.spent / am.plan, 1) * 100}%"></b></div>` : ""}</div>`; }).join("");
    const circ = 2 * Math.PI * 118, pct = a ? Math.round(a.spent / a.plan * 100) : 0, pace = d.day / d.days;
    const left = a ? `<div class="wc-bring"><div class="wc-ring"><svg viewBox="0 0 280 280"><circle cx="140" cy="140" r="118" fill="none" stroke="var(--track)" stroke-width="20"/>
        <circle cx="140" cy="140" r="118" fill="none" stroke="var(--ink)" stroke-width="20" stroke-linecap="round" stroke-dasharray="${circ * a.spent / a.plan} ${circ}"/>
        <g transform="rotate(${pace * 360} 140 140)"><rect x="137.5" y="12" width="5" height="32" rx="2.5" fill="var(--accent)"/></g></svg><div class="rc"><b>${pct}%</b><span>of plan used</span></div></div>
        <div><div class="wc-big">${money(a.spent)}</div><div class="wc-of">of ${money(a.plan)} planned</div></div></div>`
      : `<div class="wc-bring"><div class="wc-ring"><span class="wc-seal ${over ? "no" : ""}" style="width:100%;height:100%;margin:0;${over ? "color:var(--warn)" : ""}">${ic(over ? "alert" : "check")}</span></div>
        <div><div class="wc-big">${over ? "Over" : "On track"}</div><div class="wc-of">Overall, month to date</div></div></div>`;
    return wrap("budget_summary", "", `${head("trend", d.period_label, `<span class="wc-chip">Day ${d.day} of ${d.days}</span>`)}${left}<div>${rows}</div>
      ${a ? `<div class="wc-note">${ic("eye")}<span>Hides again in 20 seconds. Tap to hide now.</span></div>` : `<button class="wc-reveal">${ic("lock")}PIN to show amounts</button>
      <div class="wc-note">${ic("lock")}<span>Amounts only show, or get read aloud, after an adult enters a PIN.</span></div>`}${foot(c, card)}`); };

  /* ---------------- approvals ---------------- */
  R.approval_request = (card, c) => { const d = card.data, over = d.amount > c.limit, off = c.offline; const ap = mem(c, d.approver);
    return wrap("approval_request", "", `${head("phone", "Waiting for approval", `<span class="wc-chip ${off ? "warn" : ""}">${off ? "Paused" : "1 of 1"}</span>`, true)}
      <div class="wc-body"><div class="wc-t">${esc(d.item)}</div><div class="wc-s">${money(d.amount)} &nbsp;&middot;&nbsp; ${esc(d.merchant)}</div>
      ${d.reason ? `<div class="wc-n">${esc(d.reason)}</div>` : ""}
      <div class="wc-line" style="font-size:calc(var(--u)*23)">${av(c, d.approver)}Sent to ${esc(ap.name)}'s phone</div></div>
      ${over && !off ? `<div class="wc-note warn">${ic("phone")}<span>Over ${money(c.limit)} - approve on your phone</span></div>` : ""}
      ${off ? `<div class="wc-off">${ic("clock")}Approvals will be back when we reconnect</div>` : `<div class="wc-act">${over ? "" : '<button class="wc-b pri">Approve</button>'}<button class="wc-b">Decline</button></div>
      <div class="wc-note">${ic("lock")}<span>${over ? "Decline asks for your PIN." : "Approve and decline both ask for your PIN."}</span></div>`}${foot(c, card)}`); };
  R.approval_pin = (card, c) => { const d = card.data, n = d.pin_length || 6, bad = d.state === "wrong", lock = d.state === "locked";
    const msg = lock ? `Too many tries. Try again in ${d.lock_minutes || 5} minutes.` : bad ? `That PIN did not match. ${d.tries_left} ${d.tries_left === 1 ? "try" : "tries"} left.` : "";
    return wrap("approval_pin", "wc-pin" + (lock ? " locked" : ""), `<div class="pq">${d.action === "decline" ? "Decline" : "Approve"}: ${esc(d.item)}</div><h2>Enter your PIN</h2>
      <div class="pd ${bad || lock ? "bad" : ""}">${Array.from({ length: n }, (_, i) => `<i class="${i < d.entered ? "f" : ""}"></i>`).join("")}</div><div class="pmsg">${esc(msg)}</div>
      <div class="pk3">${["1","2","3","4","5","6","7","8","9","Cancel","0","Delete"].map(k => `<span class="k ${k.length > 1 ? "w" : ""}">${k}</span>`).join("")}</div>
      <div class="pf">${ic("lock")}<span>From ${the(c)}. PIN is checked on our server and never stored on this iPad.</span></div>`); };
  R.approval_result = (card, c) => { const d = card.data, ok = d.outcome === "approved" || d.outcome === "sent_to_phone";
    const H = { approved: "Approved", declined: "Declined", expired: "Expired", sent_to_phone: "Sent to phone" };
    return wrap("approval_result", "wc-res", `<span class="wc-seal ${ok ? "" : "no"}">${ic(ok ? "check" : "x")}</span><div class="wc-t">${H[d.outcome]}</div><div class="wc-s">${esc(d.item)}</div>
      <div class="wc-n">${esc(d.detail)}</div>${foot(c, card)}`); };

  /* ---------------- reminder / to-do ---------------- */
  const due = (s, c) => `${day(s, c.now)}, ${tm(s)}`;
  R.reminder = (card, c) => { const d = card.data, one = d.kind === "reminder", it = d.items[0];
    if (one) { const mins = it.due ? Math.round((ms(it.due) - ms(c.now)) / 60000) : null, soon = mins != null && mins >= 0 && mins <= 60;
      return wrap("reminder", "", `${head("bell", "Reminder", it.owner ? who(c, it.owner) : "")}<div class="wc-body"><div class="wc-t">${esc(it.text)}</div>
        ${it.due ? `<div class="wc-s">${due(it.due, c)}</div>${soon ? `<span class="wc-chip warn">In ${mins} min</span>` : ""}` : ""}</div>
        <div class="wc-act"><button class="wc-b pri">${ic("check")}Done</button><button class="wc-b">Snooze 10 min</button></div>${foot(c, card)}`); }
    return wrap("reminder", "", `${head("list", d.title || "To-do", `<span class="wc-chip">${d.items.filter(i => !i.done).length} left</span>`)}<div>${d.items.map(i =>
      `<div class="wc-li ${i.done ? "done" : ""}">${i.done ? ic("check", "ck") : '<span class="dot"></span>'}<div><div class="tx">${esc(i.text)}</div>${i.due ? `<div class="du">${due(i.due, c)}</div>` : ""}</div>${i.owner ? av(c, i.owner) : ""}</div>`).join("")}</div>${foot(c, card, { meta: "Tap the mic to add" })}`); };


  /* ---------------- inbox digest ---------------- */
  const dueChip = (s, now) => { const l = loc(s), hasTime = /T\d{2}:\d{2}/.test(s) && (l.h || l.mi);
    const k = dayKey(s) - dayKey(now), dayn = k === 0 ? "Today" : k === 1 ? "Tomorrow" : dshort(s);
    if (!hasTime) return k === 0 ? "Due today" : k === 1 ? "Due tomorrow" : "Due " + dmd(s);
    return dayn + ", " + tm(s); };
  R.inbox_digest = (card, c) => { const d = card.data, n = d.items.length;
    return wrap("inbox_digest", "", `${head("mail", "Inbox", `<span class="wc-chip">${n} new</span>`)}
      <div class="wc-inb">${d.items.map(i => `<div class="wc-in"><div class="from">${esc(i.sender)}</div>${i.due ? `<span class="wc-chip">${esc(dueChip(i.due, c.now))}</span>` : ""}<div class="topic">${esc(i.topic)}</div></div>`).join("")}</div>
      <div class="wc-act"><button class="wc-b">${ic("arrow")}Show me more</button></div>
      <div class="wc-note"><span>Opens in the Grok Bot app.</span></div>${foot(c, card)}`); };

  /* ---------------- weather / answer / working ---------------- */
  const WXI = { clear: "sun", partly_cloudy: "partly", cloudy: "cloud", rain: "rain", storm: "storm", snow: "snow", fog: "fog", wind: "wind" };
  R.weather = (card, c) => { const d = card.data;
    return wrap("weather", "", `${head("sun", "Weather", `<span class="wc-n sm">${esc(d.location)}</span>`)}<div class="wc-body"><div class="wc-s" style="color:var(--ink2)">${day(d.date, c.now)}, ${dmd(d.date)}</div></div>
      <div class="wc-wx">${ic(WXI[d.condition])}<div class="tp">${d.temp}&deg;</div><div><div class="wc-s">${esc(d.summary)}</div><div class="wc-n">High ${d.high}&deg; Low ${d.low}&deg;</div></div></div>
      ${d.days && d.days.length ? `<div class="wc-days">${d.days.map(x => `<div class="wc-day"><span class="dn">${dshort(x.date)}</span>${ic(WXI[x.condition])}<span class="hl">${x.high}&deg; <em>${x.low}&deg;</em></span></div>`).join("")}</div>` : ""}
      ${foot(c, card, { text: "Answered by " + the(c) })}`); };
  R.answer = (card, c) => { const d = card.data;
    return wrap("answer", "wc-card-tail", `<div class="wc-q">${ic("mic")}<span>You asked: ${esc(d.question)}</span></div>
      ${card.via !== "concierge" ? `<div>${hand(c, card.via)}</div>` : ""}<div class="wc-a">${rich(d.answer)}</div>
      <div class="wc-f"><span class="fx">${ic("spark")}<span>Answered by ${the(c)}</span></span><button class="wc-b soft">Done</button></div>`); };
  R.concierge_working = (card, c) => { const d = card.data;
    return wrap("concierge_working", "wc-card-tail", `<div class="wc-q">${ic("mic")}<span>You asked: ${esc(d.question)}</span></div><div>${hand(c, card.via, "go")}</div>
      <div style="display:flex;flex-direction:column;gap:calc(var(--u)*12);margin-top:calc(var(--u)*6)"><span class="wc-sk" style="width:92%"></span><span class="wc-sk" style="width:62%"></span></div>`); };

  /* ---------------- photo ---------------- */
  R.photo = (card, c) => { const d = card.data, img = `style="background-image:url('${esc(d.image)}')" role="img" aria-label="${esc(d.alt)}"`;
    const meta = [d.shared_by ? "Shared by " + esc(mem(c, d.shared_by).name) : "", d.taken_on ? dmd(d.taken_on) : ""].filter(Boolean).join(" &nbsp;&middot;&nbsp; ");
    if (d.mode === "slideshow_frame") return wrap("photo", "wc-frame", `<div class="img" ${img}><div class="glass"><div>${d.caption ? `<div class="t">${esc(d.caption)}</div>` : ""}<div class="m">${meta}</div></div></div></div>`);
    return wrap("photo", "wc-photo", `<div class="img" ${img}></div><div class="cap">${d.caption ? `<div class="t">${esc(d.caption)}</div>` : ""}<div class="wc-n sm">${meta}</div></div>${foot(c, card, { text: "From the family photos" })}`); };

  /* ---------------- error + offline ---------------- */
  const ERR = { not_supported: ["alert", "Can't do that yet"], specialist_unavailable: ["wifioff", "Not available right now"], needs_phone: ["phone", "Needs your phone"], unclear: ["mic", "Didn't catch that"] };
  R.error = (card, c) => { const d = card.data, e = ERR[d.reason], fail = d.reason === "specialist_unavailable";
    return wrap("error", "wc-card-tail", `${head(e[0], e[1], "")}<div class="wc-eh"><span class="wc-icn ${fail ? "warn" : ""}">${ic(e[0])}</span><div><h2>${esc(d.headline)}</h2><p>${esc(d.detail)}</p></div></div>
      ${d.next_step ? `<div class="wc-next">${ic("arrow")}<span>${esc(d.next_step)}</span></div>` : ""}
      <div class="wc-act">${d.retry ? `<button class="wc-b">${ic("retry")}Try again</button>` : ""}<button class="wc-b pri">Done</button></div>${foot(c, card, { hand: fail ? "fail" : "done" })}`); };
  R.offline_queued = (card, c) => { const d = card.data, sent = d.queued.every(q => q.status === "sent"), n = d.queued.filter(q => q.status === "queued").length;
    return wrap("offline_queued", "", `<div class="wc-eh"><span class="wc-icn">${ic(sent ? "wifi" : "wifioff")}</span><div><h2>${sent ? "Back online" : "Reconnecting"}</h2>
      <p>${sent ? esc(c.name) + " is sending what you asked while we were offline." : "Wi-Fi dropped. This display comes back on its own. Showing what it knew at " + tm(d.last_seen_at) + "."}</p></div></div>
      <div class="wc-list">${d.queued.map(q => `<div class="wc-qi ${q.status === "sent" ? "sent" : ""}">${ic(q.status === "sent" ? "check" : "outbox")}<div class="wc-qt"><div class="wc-qq">${esc(q.text)}</div>
        <div class="wc-qs">${q.status === "sent" ? "Sent - " + esc(c.name) + " passed it on" : "Saved - " + esc(c.name) + " will send this when we reconnect"}</div></div>
        <b class="wc-qn ${q.status === "sent" ? "sent" : ""}">${q.status === "sent" ? "Sent" : n === 1 ? "1 waiting" : "Waiting"}</b></div>`).join("")}</div>
      ${sent ? "" : `<div class="wc-off">${ic("clock")}Approvals will be back when we reconnect</div>`}${foot(c, card)}`); };

  /* ---------------- parts (handoff states, chips, buttons) ---------------- */
  R.parts = (card, c) => wrap("parts", "", `${head("spark", "Parts")}<div class="wc-body"><div class="wc-n sm">Handoff line (set by the wall, never by the bot)</div>
      ${hand(c, "shopper", "go")}${hand(c, "shopper", "done")}${hand(c, "shopper", "fail")}</div>
      <div class="wc-body"><div class="wc-n sm">Status chips</div><div class="wc-act"><span class="wc-status">${ic("check")}On track</span><span class="wc-status warn">${ic("alert")}Over</span><span class="wc-chip">Neutral</span><span class="wc-chip warn">Needs you</span></div></div>
      <div class="wc-body"><div class="wc-n sm">Buttons (58u tall = 47pt)</div><div class="wc-act"><button class="wc-b pri">Primary</button><button class="wc-b">Secondary</button><button class="wc-b soft">Quiet</button></div></div>
      <div class="wc-body"><div class="wc-n sm">Member</div><div class="wc-act">${who(c, "alex")}${who(c, "riley")}</div></div>`);

  const NOW = "2026-11-27T15:10:00-08:00";
  g.HYPXCards = { SPEC, R, esc, defaultCtx: members => ({ now: NOW, name: "Concierge", limit: 150, offline: false, members }),
    render: (card, ctx) => R[card.type] ? R[card.type](card, ctx) : `<div class="wc"><div class="wc-n">Unknown card type: ${esc(card.type)}</div></div>` };
})(window);
