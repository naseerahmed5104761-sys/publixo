/* ===== PubliXo AI Chat Widget — Multi-language (EN / Roman Urdu / اردو), Girl Voice ===== */
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
  const IDLE = "Ask by text or voice";
  const $ = (id) => document.getElementById(id);
  const box = $("pxBox"), msgs = $("pxMsgs"), input = $("pxIn"), mic = $("pxMic"),
        liveBtn = $("pxLive"), statusEl = $("pxStatus"), langSel = $("pxLang");
  const synth = window.speechSynthesis;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  const LISTEN_LANG_MAP = { en: "en-IN", roman: "en-IN", ur: "ur-PK", auto: "en-IN" };
  const SPEAK_LANG_MAP  = { en: "en-GB", roman: "en-IN", ur: "ur-PK", auto: "en-GB" };

  let history = [], busy = false, speaking = false, live = false, rec = null,
      usedVoice = false, interimEl = null, speakToken = 0, lastVoiceLang = "en";

  const setStatus = (t) => { statusEl.textContent = t; };
  function add(text, who) {
    const d = document.createElement("div");
    d.className = "pxm " + who;
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  add("Hello! 👋 Welcome to PubliXo. Ask me about websites, Meta Ads, social media or QR codes — in English, Roman Urdu, or اردو. You can type, or tap 📞 Live Chat and just talk to me.", "bot");

  /* ---------- Language detection ---------- */
  function detectLang(text) {
    if (/[\u0600-\u06FF]/.test(text)) return "ur";
    const romanUrdu = /\b(kya|kaise|kaisay|kitna|kitne|kahan|kab|kyun|kyu|nahi|nahin|hai|hain|ho|ka|ki|ke|ko|se|mein|me|ap|aap|tum|hum|mujhe|mera|meri|apka|apki|acha|theek|bhai|ji|kar|karo|karna|bata|batao|chahiye|milega|milegi|rate|kiya|kaam|banwana|banana|paisa|paise|kitni|kitne|website|banwa|chahta|chahti|chahye|batana|bataen|batao)\b/i;
    if (romanUrdu.test(text)) return "roman";
    return "en";
  }

  function resolveLang(text) {
    const sel = langSel.value;
    if (sel === "auto") return detectLang(text);
    return sel;
  }

  /* ---------- Voice picking (girl default) ---------- */
  // Girl voice ko priority. Male list sirf fallback ke liye.
  const FEMALE = /sonia|libby|maisie|hazel|susan|kate|serena|martha|stephanie|female|woman|girl|samantha|zira|aria|jenny|michelle|emma|olivia|ava|allison|joanna|salli|kendra|kimberly|amy|nicole|raveena|heera|swara|kalpana|neerja|aditi|priya|veena|urdu|zariyah|hala|salma|layla|amina/i;
  const MALE = /ryan|thomas|george|daniel|oliver|arthur|alfie|male|man|boy|david|mark|guy|alex|fred|rishi|prabhat|hemant|madhur|ravi|kunal|hindi|urdu-male/i;

  function pickVoice(langCode) {
    const all = synth ? synth.getVoices() : [];
    if (!all.length) return null;
    const norm = (v) => v.lang.replace("_", "-").toLowerCase();

    // 1) Urdu voice (agar urdu script)
    if (langCode && langCode.toLowerCase().startsWith("ur")) {
      const urPool = all.filter((v) => norm(v).startsWith("ur"));
      if (urPool.length) {
        const named = urPool.filter((v) => FEMALE.test(v.name));
        return named[0] || urPool[0];
      }
      // Urdu voice na mile to Hindi/Indian female voice (Urdu script padh sakti hai)
      const hiPool = all.filter((v) => norm(v).startsWith("hi") || norm(v).startsWith("en-in"));
      const hiFemale = hiPool.filter((v) => FEMALE.test(v.name));
      if (hiFemale.length) return hiFemale[0];
      if (hiPool.length) return hiPool[0];
    }

    // 2) English / Roman Urdu ke liye female voice, priority en-gb > en-in > en
    for (const code of ["en-gb", "en-in", "en"]) {
      const pool = all.filter((v) => norm(v).startsWith(code));
      if (!pool.length) continue;
      const female = pool.filter((v) => FEMALE.test(v.name) && !MALE.test(v.name));
      if (female.length) {
        return female.sort((a, b) => /natural|online|google/i.test(b.name) - /natural|online|google/i.test(a.name))[0];
      }
    }
    // 3) Koi bhi female voice
    const anyFemale = all.filter((v) => FEMALE.test(v.name) && !MALE.test(v.name));
    if (anyFemale.length) return anyFemale[0];
    // 4) Last resort
    return all[0] || null;
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
    const chunks = text.match(/[^.!?\n]+[.!?]?/g) || [text];
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
      u.rate = 0.95;
      // Girl voice default — high pitch
      u.pitch = 1.15;
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
        // Voice input ki zabaan yaad rakho
        lastVoiceLang = resolveLang(finalText);
        send(finalText);
      } else if (live) setTimeout(startListen, 250);
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

  /* ---------- Chat ---------- */
  async function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true;
    stopListen();
    add(text, "me");
    input.value = "";
    const wait = add("...", "bot");
    setStatus("Thinking...");

    const lang = usedVoice ? lastVoiceLang : resolveLang(text);

    let reply = "";
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.slice(-8),
          english: lang === "en",
          lang: lang,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.reply) throw new Error("bad");
      reply = data.reply;
      wait.textContent = reply;
      history.push({ role: "user", content: text }, { role: "assistant", content: reply });
    } catch (e) {
      reply = lang === "ur"
        ? "معذرت، میں ابھی جواب نہیں دے سکتی۔ براہ کرم 0301 5394177 پر کال یا واٹس ایپ کریں۔"
        : lang === "roman"
        ? "Maazrat, main abhi jawab nahi de sakti. Please 0301 5394177 par call ya WhatsApp karein."
        : "Sorry, I can't answer right now. Please call or WhatsApp us on 0301 5394177.";
      wait.textContent = reply;
    }
    msgs.scrollTop = msgs.scrollHeight;
    busy = false;

    const wasVoice = usedVoice;
    usedVoice = false;
    if (live || wasVoice) {
      speak(reply, lang, () => { if (live) startListen(); else setStatus(IDLE); });
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
  $("pxBtn").onclick = () => { box.classList.toggle("open"); if (box.classList.contains("open")) input.focus(); else stopLive(); };
  $("pxClose").onclick = () => { box.classList.remove("open"); stopLive(); };
  langSel.onchange = () => { if (speaking) stopSpeaking(); };

  if (synth) { synth.getVoices(); synth.onvoiceschanged = () => synth.getVoices(); }
  window.addEventListener("beforeunload", () => { stopSpeaking(); });
})();
