/* ===== PubliXo AI Chat Widget — Multi-language (EN / Roman Urdu / اردو), Girl Voice + Lead Capture ===== */
(function () {
  // ========== 1. CSS INJECT ==========
  const style = document.createElement('style');
  style.innerHTML = `
  #pxBtn{position:fixed;right:20px;bottom:20px;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;z-index:2000;
    background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#0a0f1e;font-size:26px;box-shadow:0 6px 24px rgba(245,158,11,.5)}
  #pxBox{position:fixed;right:20px;bottom:92px;width:360px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100vh - 120px);
    background:#0a0f1e;border:1px solid rgba(245,158,11,.35);border-radius:18px;display:none;flex-direction:column;z-index:2000;
    box-shadow:0 20px 50px rgba(0,0,0,.6);font-family:Inter,Arial,sans-serif;overflow:hidden}
  #pxBox.open{display:flex}
  #pxHead{padding:14px 16px;background:linear-gradient(135deg,#1a2332,#0a0f1e);border-bottom:1px solid rgba(245,158,11,.25);
    display:flex;align-items:center;justify-content:space-between;color:#fff;font-weight:700}
  #pxHead small{display:block;color:#94a3b8;font-weight:400;font-size:11px}
  #pxHead button{background:none;border:none;color:#fbbf24;font-size:18px;cursor:pointer;margin-left:8px}
  #pxMsgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
  .pxm{max-width:82%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}
  .pxm.bot{background:#1a2332;color:#e2e8f0;align-self:flex-start;border-bottom-left-radius:4px}
  .pxm.me{background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#0a0f1e;align-self:flex-end;border-bottom-right-radius:4px}
  .pxm.interim{opacity:.55;font-style:italic}
  .pxm.rtl{direction:rtl;text-align:right}
  .pxm.ask{border-left:3px solid #fbbf24;background:#222c3d}
  .pxm.rtl.ask{border-left:0;border-right:3px solid #fbbf24}
  #pxOpts{display:flex;gap:6px;padding:8px 10px;background:#111827;border-top:1px solid rgba(245,158,11,.2);align-items:center}
  #pxOpts select{background:#1a2332;color:#fbbf24;border:none;border-radius:8px;font-size:12px;padding:8px 6px;cursor:pointer;min-width:0;flex:1}
  #pxLive{flex:0 0 auto;border:none;border-radius:20px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;
    background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;white-space:nowrap}
  #pxLive.on{background:linear-gradient(135deg,#ef4444,#dc2626);animation:pxp 1.4s infinite}
  #pxBar{display:flex;gap:6px;padding:10px;border-top:1px solid rgba(245,158,11,.2);background:#111827;align-items:center}
  #pxIn{flex:1;background:#0a0f1e;border:1px solid rgba(245,158,11,.25);border-radius:22px;padding:10px 14px;color:#fff;font-size:14px;outline:none;min-width:0}
  #pxBar button{width:38px;height:38px;border-radius:50%;border:none;cursor:pointer;font-size:16px;flex-shrink:0;background:#1a2332;color:#fbbf24}
  #pxSend{background:linear-gradient(135deg,#f59e0b,#fbbf24)!important;color:#0a0f1e!important}
  #pxMic.on{background:#ef4444!important;color:#fff!important;animation:pxp 1s infinite}
  @keyframes pxp{50%{opacity:.6}}
  `;
  document.head.appendChild(style);

  // ========== 2. HTML INJECT ==========
  const widgetHTML = `
  <button id="pxBtn" aria-label="Chat with PubliXo">💬</button>
  <div id="pxBox">
    <div id="pxHead">
      <div>PubliXo Assistant<small id="pxStatus">Ask by text or voice</small></div>
      <div><button id="pxClose" title="Close">✕</button></div>
    </div>
    <div id="pxMsgs"></div>
    <div id="pxOpts">
      <select id="pxLang" title="Language">
        <option value="auto">🌐 Auto</option>
        <option value="en">English</option>
        <option value="roman">Roman Urdu</option>
        <option value="ur">اردو</option>
      </select>
      <button id="pxLive" title="Hands-free live conversation">📞 Live Chat</button>
    </div>
    <div id="pxBar">
      <button id="pxMic" title="Tap and speak once">🎤</button>
      <input id="pxIn" type="text" placeholder="Type your question..." maxlength="500" />
      <button id="pxSend" title="Send">➤</button>
    </div>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  // ========== 3. JAVASCRIPT LOGIC ==========
  const API = "https://wa-bot.naseersatti0301.workers.dev/chat";
  const LEAD_API = API.replace(/\/chat$/, "/lead");
  const LEAD_END_API = API.replace(/\/chat$/, "/lead/end");
  const END_IDLE_MS = 3 * 60 * 1000;   // itni der koi message na aaye to baat-cheet khatam maani jaye
  const SID = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
  const LEAD_AFTER = 3;           // itne sawalon ke baad naam/number poochho
  const IDLE = "Ask by text or voice";
  const $ = (id) => document.getElementById(id);
  const box = $("pxBox"), msgs = $("pxMsgs"), input = $("pxIn"), mic = $("pxMic"),
        liveBtn = $("pxLive"), statusEl = $("pxStatus"), langSel = $("pxLang");
  const synth = window.speechSynthesis;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // Listening: Urdu bolo -> ur-PK, English bolo -> en-IN (Pakistani/Indian accent ko behtar samajhta hai)
  const LISTEN_LANG_MAP = { en: "en-IN", roman: "en-IN", ur: "ur-PK", auto: "en-IN" };
  // Speaking: clean English = en-US, Urdu = ur-PK (Uzma)
  const SPEAK_LANG_MAP  = { en: "en-GB", roman: "en-IN", ur: "ur-PK", auto: "en-GB" };
  // Bolne ki raftaar: 1 = normal, 0.8 = aur dheema. Apni pasand se badal sakte ho.
  const SPEAK_RATE = { en: 0.88, roman: 0.9, ur: 0.9 };

  let history = [], busy = false, speaking = false, live = false, rec = null,
      usedVoice = false, interimEl = null, speakToken = 0, lastVoiceLang = "en";

  // Lead capture state (AI naam/number khud samajhta hai, widget sirf yaad rakhta hai)
  let userMsgs = 0, chatLang = "en";
  let leadName = "", leadPhone = "", leadInterest = "", leadDeclined = false, leadSubmitted = false; // leadSubmitted = naam+number mil gaye
  let leadSent = false, endTimer = null;                                                                         // leadSent = email ka signal ja chuka
  let leadAsks = 0, sinceAsk = 0;

  const setStatus = (t) => { statusEl.textContent = t; };
  function add(text, who) {
    const d = document.createElement("div");
    d.className = "pxm " + who;
    if (/[\u0600-\u06FF]/.test(text)) d.classList.add("rtl");
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  add("Hi! 👋 I'm Sara from PubliXo. Ask me about websites, Meta Ads, social media or QR codes, or just say hello!", "bot");

  /* ---------- Language detection ---------- */
  function detectLang(text) {
    if (/[\u0600-\u06FF]/.test(text)) return "ur";
    // Sirf wo alfaaz jo English se nahi takrate ("me", "rate", "banana" jaise English lafz yahan nahi hain)
    const markers = /\b(kya|kaise|kaisay|kitna|kitne|kitni|kahan|kab|kyun|kyu|nahi|nahin|hai|hain|ho|ka|ki|ke|ko|se|mein|ap|aap|tum|hum|mujhe|mera|meri|apka|apki|acha|theek|bhai|ji|kar|karo|karna|bata|batao|chahiye|milega|milegi|kiya|kaam|banwana|paisa|paise|banwa|chahta|chahti|chahye|batana|bataen|haan|shukriya|zaroor|abhi)\b/gi;
    const score = (text.match(markers) || []).length;
    const words = text.trim().split(/\s+/).length;
    // Ek hi lafz se faisla nahi: kam az kam 2 nishaniyan, ya bohat chhota message
    if (score >= 2 || (score === 1 && words <= 3)) return "roman";
    return "en";
  }

  function resolveLang(text) {
    const sel = langSel.value;
    if (sel === "auto") return detectLang(text);
    return sel;
  }

  /* ---------- Voice picking ---------- */
  const FEMALE = /uzma|sonia|libby|maisie|hazel|susan|kate|serena|martha|stephanie|female|woman|girl|samantha|zira|aria|jenny|michelle|emma|olivia|ava|allison|joanna|salli|kendra|kimberly|amy|nicole|raveena|heera|swara|kalpana|neerja|aditi|priya|veena|zariyah|hala|salma|layla|amina/i;
  // \b zaroori hai warna "female" ke andar "male" match ho jata hai
  const MALE = /\b(ryan|thomas|george|daniel|oliver|arthur|alfie|male|man|boy|david|mark|guy|alex|fred|rishi|prabhat|hemant|madhur|ravi|kunal|asad|salman|liam|james|brian|eric|roger|steffan)\b/i;

  const normLang = (v) => v.lang.replace("_", "-").toLowerCase();
  const vScore = (v) =>
    (FEMALE.test(v.name) ? 4 : 0) +
    (/natural|online/i.test(v.name) ? 3 : 0) +
    (/google|microsoft/i.test(v.name) ? 1 : 0);
  const best = (pool) => pool.sort((a, b) => vScore(b) - vScore(a))[0] || null;

  function pickVoice(langCode) {
    const all = synth ? synth.getVoices() : [];
    if (!all.length) return null;
    const code = (langCode || "en-GB").toLowerCase();
    const notMale = (v) => !MALE.test(v.name);

    // --- Urdu: Uzma pehle ---
    if (code.startsWith("ur")) {
      const ur = all.filter((v) => normLang(v).startsWith("ur") && notMale(v));
      const uzma = ur.find((v) => /uzma/i.test(v.name));
      if (uzma) return uzma;
      if (ur.length) return best(ur);
      // Urdu voice na ho to Hindi female (Urdu script padh leti hai)
      const hi = all.filter((v) => normLang(v).startsWith("hi") && notMale(v));
      if (hi.length) return best(hi);
      return null;
    }

    // --- Roman Urdu: Indian female (Roman Urdu/Hindi ke alfaaz behtar bolti hai) ---
    if (code === "en-in") {
      const inPool = all.filter((v) => normLang(v) === "en-in" && notMale(v));
      if (inPool.length) return best(inPool);
    }

    // --- English: UK (en-GB) female pehle, phir US/AU/CA female. Indian accent nahi ---
    for (const group of [["en-gb"], ["en-us"], ["en-au", "en-ca"]]) {
      const pool = all.filter((v) => group.includes(normLang(v)) && notMale(v));
      const f = pool.filter((v) => FEMALE.test(v.name));
      if (f.length) return best(f);
    }
    const anyEn = all.filter((v) => normLang(v).startsWith("en") && !normLang(v).startsWith("en-in") && notMale(v));
    if (anyEn.length) return best(anyEn);
    return all.find((v) => normLang(v).startsWith("en")) || all[0];
  }

  function cleanForSpeech(t) {
    return t
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[*_`#>~]/g, "")
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function stopSpeaking() {
    speaking = false;
    speakToken++;
    synth && synth.cancel();
  }

  function speak(text, langCode, done) {
    text = cleanForSpeech(text);
    if (!synth || !text) { done && done(); return; }
    stopSpeaking();
    const token = ++speakToken;
    const speakLang = SPEAK_LANG_MAP[langCode] || "en-GB";
    const voice = pickVoice(speakLang);
    const chunks = text.match(/[^.!?۔؟\n]+[.!?۔؟]?/g) || [text];
    speaking = true;
    stopListen();
    setStatus("Speaking... 🔊");

    let i = 0;
    const finish = () => {
      if (token !== speakToken || !speaking) return;
      speaking = false;
      done && done();
    };
    const next = () => {
      if (token !== speakToken) return;
      if (i >= chunks.length) return finish();
      const piece = chunks[i++].trim();
      if (!piece) return next();
      const u = new SpeechSynthesisUtterance(piece);
      u.lang = voice ? voice.lang : speakLang;
      if (voice) u.voice = voice;
      u.rate = SPEAK_RATE[langCode] || 0.9;
      u.pitch = 1; // natural voice, no artificial pitch
      u.onend = next;
      u.onerror = next;
      synth.speak(u);
    };
    next();
  }

  /* ---------- Listening ---------- */
  function stopListen() {
    if (rec) { const r = rec; rec = null; r.onend = null; r.onerror = null; try { r.abort(); } catch (e) {} }
    mic.classList.remove("on");
    if (interimEl) { interimEl.remove(); interimEl = null; }
  }

  function startListen() {
    if (!SR || !live || speaking || busy || rec) return;
    const r = new SR();
    rec = r;
    const selLang = langSel.value === "auto" ? lastVoiceLang : langSel.value;
    r.lang = LISTEN_LANG_MAP[selLang] || "en-IN";
    r.continuous = false;
    r.interimResults = true;
    let finalText = "";
    r.onstart = () => { mic.classList.add("on"); setStatus("Listening... 🎤 go ahead"); };
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      if (interim) {
        if (!interimEl) interimEl = add("", "me interim");
        interimEl.textContent = interim;
        msgs.scrollTop = msgs.scrollHeight;
      }
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        stopLive();
        add("Microphone access is blocked. Click the 🔒 icon in your browser's address bar and allow the microphone.", "bot");
      }
    };
    r.onend = () => {
      if (rec !== r) return;
      rec = null;
      mic.classList.remove("on");
      if (interimEl) { interimEl.remove(); interimEl = null; }
      if (finalText.trim()) {
        usedVoice = true;
        lastVoiceLang = resolveLang(finalText); // Urdu bola -> "ur", English bola -> "en"
        send(finalText);
      } else if (live) {
        // Auto mode: kuch sunai na diya to agli dafa dusri zabaan try karo
        if (langSel.value === "auto") lastVoiceLang = lastVoiceLang === "ur" ? "en" : "ur";
        setTimeout(startListen, 250);
      }
    };
    try { r.start(); } catch (e) { rec = null; setTimeout(startListen, 500); }
  }

  /* ---------- Live mode ---------- */
  function startLive() {
    if (!SR) { add("Your browser doesn't support voice input. Please use Chrome or Edge.", "bot"); return; }
    live = true;
    liveBtn.classList.add("on");
    liveBtn.textContent = "⏹ Stop";
    setStatus("Starting live chat...");
    startListen();
  }
  function stopLive() {
    live = false;
    stopListen();
    stopSpeaking();
    liveBtn.classList.remove("on");
    liveBtn.textContent = "📞 Live Chat";
    setStatus(IDLE);
  }
  liveBtn.onclick = () => (live ? stopLive() : startLive());

  /* ---------- Lead capture ---------- */
  const LEAD_FAIL = {
    en: "Thanks, {name}! I couldn't pass on your details just now. Please WhatsApp us on 0301 5394177 and we'll help right away.",
    roman: "Shukriya {name}! Abhi aap ki details nahi bhej saki. Meherbani karke 0301 5394177 par WhatsApp karein.",
    ur: "شکریہ {name}! ابھی آپ کی تفصیلات نہیں بھیج سکی۔ براہ کرم 0301 5394177 پر واٹس ایپ کریں۔",
  };

  // Naam + number mil gaye: server par "pending" save karo. Email ABHI nahi jati.
  async function submitLead() {
    try {
      const r = await fetch(LEAD_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sid: SID,
          name: leadName,
          phone: leadPhone,
          interest: leadInterest,
          lang: chatLang,
          page: location.href,
          chat: history.slice(-40),
        }),
      });
      return r.ok;
    } catch (e) {
      return false;
    }
  }

  // Baat-cheet khatam: ab poori conversation ke saath email jaye (sirf ek dafa)
  function finalizeLead(reason, viaBeacon) {
    if (!leadSubmitted || leadSent) return;
    leadSent = true;
    clearTimeout(endTimer);
    const payload = JSON.stringify({
      sid: SID, reason: reason,
      name: leadName, phone: leadPhone, interest: leadInterest,
      lang: chatLang, page: location.href, chat: history.slice(-40),
    });
    try {
      if (viaBeacon && navigator.sendBeacon) {
        navigator.sendBeacon(LEAD_END_API, new Blob([payload], { type: "text/plain;charset=UTF-8" }));
        return;
      }
      fetch(LEAD_END_API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: payload,
        keepalive: true,   // page band ho tab bhi request poori ho
      }).catch(() => {});
    } catch (e) {}
  }

  // Har message ke baad timer dobara shuru: 3 minute khamoshi = baat-cheet khatam
  function scheduleEnd() {
    clearTimeout(endTimer);
    if (leadSubmitted && !leadSent) endTimer = setTimeout(() => finalizeLead("idle"), END_IDLE_MS);
  }

  // AI ne jo naam/number/inkar samjha, wo yahan yaad rakho
  function applyLead(l) {
    if (!l || typeof l !== "object") return;
    if (l.declined) leadDeclined = true;
    if (l.name) leadName = String(l.name).slice(0, 60);
    if (l.phone) leadPhone = String(l.phone);
    if (l.interest) leadInterest = String(l.interest).slice(0, 120);
    if (l.asked) { leadAsks++; sinceAsk = 0; } else if (leadAsks > 0) sinceAsk++;

    if (leadName && leadPhone && !leadSubmitted) {
      leadSubmitted = true;
      submitLead().then((ok) => {
        if (!ok) {
          const k = chatLang === "ur" ? "ur" : chatLang === "roman" ? "roman" : "en";
          add(LEAD_FAIL[k].replace("{name}", leadName), "bot");
        }
      });
      scheduleEnd();
    }
  }

  /* ---------- Chat ---------- */
  async function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true;
    stopListen();
    add(text, "me");
    input.value = "";

    // Voice on ho to Roman ki jagah Urdu script, text mode mein jo likha usi zabaan mein
    let lang = usedVoice ? lastVoiceLang : resolveLang(text);
    if ((live || usedVoice) && lang === "roman") lang = "ur";
    const wasVoice = usedVoice;
    usedVoice = false;
    chatLang = lang;

    const wait = add("...", "bot");
    setStatus("Thinking...");

    // 3 sawalon ke baad AI se kaho ke naam/number naram andaz mein poochhe
    const leadActive = !leadDeclined && !leadSubmitted && (userMsgs + 1 >= LEAD_AFTER);
    const askNow = leadActive && (leadAsks === 0 || (leadAsks === 1 && sinceAsk >= 3));
    const leadInfo = {
      active: leadActive,
      ask_now: askNow,
      just_asked: leadAsks > 0 && sinceAsk === 0,   // pichla jawab hi naam/number ka sawal tha
      name: leadName || null,
      phone: leadPhone || null,
      declined: leadDeclined,
    };

    let reply = "", followup = "";
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.slice(-8),
          english: lang === "en",
          lang: lang,
          lead: leadInfo,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.reply) throw new Error("bad");
      reply = data.reply;
      wait.textContent = reply;
      if (/[\u0600-\u06FF]/.test(reply)) wait.classList.add("rtl");
      followup = data.followup ? String(data.followup) : "";
      history.push({ role: "user", content: text }, { role: "assistant", content: reply + (followup ? " " + followup : "") });
      userMsgs++;   // sirf kamyab jawab wale sawal ginte hain
      applyLead(data.lead);
    } catch (e) {
      reply = lang === "ur"
        ? "معذرت، میں ابھی جواب نہیں دے سکتی۔ براہ کرم 0301 5394177 پر کال یا واٹس ایپ کریں۔"
        : lang === "roman"
        ? "Maazrat, main abhi jawab nahi de sakti. Please 0301 5394177 par call ya WhatsApp karein."
        : "Sorry, I can't answer right now. Please call or WhatsApp us on 0301 5394177.";
      wait.textContent = reply;
      if (lang === "ur") wait.classList.add("rtl");
    }
    msgs.scrollTop = msgs.scrollHeight;

    // Naam / number ka sawal alag bubble mein (thodi der baad, taake nazar aaye)
    if (followup) {
      await new Promise((res) => setTimeout(res, 600));
      const q = add(followup, "bot ask");
      if (/[\u0600-\u06FF]/.test(followup)) q.classList.add("rtl");
    }
    busy = false;
    scheduleEnd();

    const spoken = followup ? reply + " " + followup : reply;
    if (live || wasVoice) {
      speak(spoken, lang, () => { if (live) startListen(); else setStatus(IDLE); });
    } else {
      setStatus(IDLE);
    }
  }

  $("pxSend").onclick = () => send(input.value);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(input.value); });

  /* ---------- Single-shot mic ---------- */
  if (!SR) {
    mic.style.display = "none";
    liveBtn.style.display = "none";
  } else {
    mic.onclick = () => {
      if (live) return;
      if (rec) { stopListen(); return; }
      const r = new SR();
      rec = r;
      const selLang = langSel.value === "auto" ? lastVoiceLang : langSel.value;
      r.lang = LISTEN_LANG_MAP[selLang] || "en-IN";
      r.interimResults = false;
      r.onstart = () => mic.classList.add("on");
      r.onend = () => { mic.classList.remove("on"); if (rec === r) rec = null; };
      r.onerror = () => { mic.classList.remove("on"); if (rec === r) rec = null; };
      r.onresult = (e) => {
        usedVoice = true;
        const t = e.results[0][0].transcript;
        lastVoiceLang = resolveLang(t);
        send(t);
      };
      try { r.start(); } catch (e) { rec = null; }
    };
  }

  /* ---------- Open / close ---------- */
  $("pxBtn").onclick = () => { box.classList.toggle("open"); if (box.classList.contains("open")) input.focus(); else { stopLive(); finalizeLead("closed"); } };
  $("pxClose").onclick = () => { box.classList.remove("open"); stopLive(); finalizeLead("closed"); };
  langSel.onchange = () => { if (speaking) stopSpeaking(); };

  if (synth) { synth.getVoices(); synth.onvoiceschanged = () => synth.getVoices(); }
  window.addEventListener("beforeunload", () => { stopSpeaking(); });
  window.addEventListener("pagehide", () => { finalizeLead("left page", true); });
})();
