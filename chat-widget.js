/* ===== PubliXo AI Chat Widget — British Jenny (Piper) + Urdu Support ===== */
(function () {
  // 1. CSS Inject
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

  // 2. HTML Inject
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

  // 3. Variables
  const API = "https://wa-bot.naseersatti0301.workers.dev/chat"; // APNA WORKER URL YAHAN DAALEIN
  const LEAD_API = API.replace(/\/chat$/, "/lead");
  const $ = (id) => document.getElementById(id);
  const box = $("pxBox"), msgs = $("pxMsgs"), input = $("pxIn"), mic = $("pxMic"),
        liveBtn = $("pxLive"), statusEl = $("pxStatus"), langSel = $("pxLang");
  const synth = window.speechSynthesis;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  const LISTEN_LANG_MAP = { en: "en-IN", roman: "en-IN", ur: "ur-PK", auto: "en-IN" };
  const SPEAK_LANG_MAP  = { en: "en-GB", roman: "en-IN", ur: "ur-PK", auto: "en-GB" };

  let history = [], busy = false, speaking = false, live = false, rec = null,
      usedVoice = false, interimEl = null, speakToken = 0, lastVoiceLang = "en";
  
  let leadState = { active: true, name: null, phone: null, declined: false, ask_now: false, just_asked: false, saved: false };
  let userMsgs = 0, chatLang = "en";

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

  add("Hi! 👋 I'm Sara from PubliXo. Ask me about websites, Meta Ads, social media or QR codes!", "bot");

  // --- Piper British Jenny Setup ---
  const ORT_URL = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/ort.wasm.min.js";
  const PIPER_BASE = "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.5/dist/";
  const PIPER_VOICE = "en_GB-jenny_dioco-medium";
  let piperSession = null, piperPromise = null, curAudio = null, curRes = null;

  function loadScript(u) {
    return new Promise((res, rej) => {
      if (window.ort) return res();
      const s = document.createElement("script");
      s.src = u; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function warmPiper() {
    if (piperPromise) return piperPromise;
    piperPromise = (async () => {
      await loadScript(ORT_URL);
      let src = await (await fetch(PIPER_BASE + "piper-tts-web.js")).text();
      src = src
        .replace('import("./piper-o91UDS6e.js")', 'import("' + PIPER_BASE + 'piper-o91UDS6e.js")')
        .replace('import("./voices_static-D_OtJDHM.js")', 'import("' + PIPER_BASE + 'voices_static-D_OtJDHM.js")')
        .replace('import("onnxruntime-web/wasm")', "Promise.resolve(window.ort)");
      const mod = await import(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
      piperSession = await mod.TtsSession.create({ voiceId: PIPER_VOICE });
      await piperSession.predict("Hello.");
    })().catch((e) => console.warn("Piper load failed:", e));
    return piperPromise;
  }

  // --- Language Detection ---
  function detectLang(text) {
    if (/[\u0600-\u06FF]/.test(text)) return "ur";
    const markers = /\b(kya|kaise|kitna|kahan|kyun|nahi|hai|hain|ka|ki|ke|ko|se|mein|aap|mujhe|mera|acha|theek|bhai|kar|batao|chahiye|milega|kaam|paisa|banwa)\b/gi;
    const score = (text.match(markers) || []).length;
    return score >= 2 ? "roman" : "en";
  }

  function resolveLang(text) {
    return langSel.value === "auto" ? detectLang(text) : langSel.value;
  }

  // --- Voice Selection (Urdu: Uzma, English: British Female) ---
  const FEMALE = /uzma|sonia|libby|maisie|hazel|susan|kate|serena|martha|female|woman|girl|samantha|zira|aria|jenny|michelle|emma|olivia|ava|joanna/i;
  const MALE = /\b(ryan|thomas|george|daniel|oliver|male|man|boy|david|mark|guy|alex|fred)\b/i;
  const normLang = (v) => v.lang.replace("_", "-").toLowerCase();
  
  function pickVoice(langCode) {
    const all = synth ? synth.getVoices() : [];
    if (!all.length) return null;
    const notMale = (v) => !MALE.test(v.name);

    if (langCode.startsWith("ur")) {
      const ur = all.filter((v) => normLang(v).startsWith("ur") && notMale(v));
      if (ur.length) return ur.find(v => /uzma/i.test(v.name)) || ur[0];
    }
    const enGB = all.filter((v) => normLang(v) === "en-gb" && notMale(v) && FEMALE.test(v.name));
    if (enGB.length) return enGB[0];
    
    return all.find(v => normLang(v).startsWith("en") && notMale(v)) || all[0];
  }

  function cleanForSpeech(t) {
    return t.replace(/https?:\/\/\S+/g, "").replace(/[*_`#>~]/g, "").replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim();
  }

  function stopSpeaking() {
    speaking = false; speakToken++;
    synth && synth.cancel();
    if (curAudio) { curAudio.pause(); curAudio = null; }
    if (curRes) { curRes(); curRes = null; }
  }

  function playUrl(url) {
    return new Promise((res) => {
      const a = new Audio(url);
      curAudio = a; curRes = res;
      const end = () => { if (curAudio === a) { curAudio = null; curRes = null; } res(); };
      a.onended = end; a.onerror = end;
      a.play().catch(end);
    });
  }

  // --- Piper Speech (Only English) ---
  function piperSpeak(text, done) {
    stopSpeaking(); const token = ++speakToken;
    speaking = true; stopListen(); setStatus("Speaking... 🔊");
    const chunks = text.match(/[^.!?\n]+[.!?]?/g) || [text];
    const gen = (c) => piperSession.predict(c).then((b) => URL.createObjectURL(b));
    (async () => {
      try {
        let nextP = gen(chunks[0]);
        for (let i = 0; i < chunks.length; i++) {
          const url = await nextP;
          if (token !== speakToken) return;
          nextP = i + 1 < chunks.length ? gen(chunks[i + 1]) : null;
          await playUrl(url); URL.revokeObjectURL(url);
          if (token !== speakToken) return;
        }
        speaking = false; done && done();
      } catch (e) {
        if (token === speakToken) browserSpeak(text, "en", done);
      }
    })();
  }

  // --- Browser Speech (Urdu & Fallback) ---
  function browserSpeak(text, langCode, done) {
    if (!synth || !text) { done && done(); return; }
    stopSpeaking(); const token = ++speakToken;
    const speakLang = SPEAK_LANG_MAP[langCode] || "en-GB";
    const voice = pickVoice(speakLang);
    const chunks = text.match(/[^.!?۔؟\n]+[.!?۔؟]?/g) || [text];
    speaking = true; stopListen(); setStatus("Speaking... 🔊");
    
    let i = 0;
    const next = () => {
      if (token !== speakToken) return;
      if (i >= chunks.length) { speaking = false; done && done(); return; }
      const piece = chunks[i++].trim();
      if (!piece) return next();
      const u = new SpeechSynthesisUtterance(piece);
      u.lang = voice ? voice.lang : speakLang;
      if (voice) u.voice = voice;
      u.rate = langCode === "ur" ? 0.85 : 0.9; 
      u.onend = next; u.onerror = next;
      synth.speak(u);
    };
    next();
  }

  function speak(text, langCode, done) {
    text = cleanForSpeech(text);
    if (!text) { done && done(); return; }
    // English -> Jenny, Urdu -> Browser
    if (piperSession && langCode === "en") piperSpeak(text, done);
    else browserSpeak(text, langCode, done);
  }

  // --- Mic & Listening ---
  function stopListen() {
    if (rec) { rec.abort(); rec = null; }
    mic.classList.remove("on");
    if (interimEl) { interimEl.remove(); interimEl = null; }
  }

  function startListen() {
    if (!SR || !live || speaking || busy || rec) return;
    const r = new SR(); rec = r;
    const selLang = langSel.value === "auto" ? lastVoiceLang : langSel.value;
    r.lang = LISTEN_LANG_MAP[selLang] || "en-IN";
    let finalText = "";

    r.onstart = () => { mic.classList.add("on"); setStatus("Listening... 🎤"); };
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (interim) {
        if (!interimEl) interimEl = add("", "me interim");
        interimEl.textContent = interim;
      }
    };
    r.onend = () => {
      if (rec !== r) return;
      rec = null; mic.classList.remove("on");
      if (interimEl) { interimEl.remove(); interimEl = null; }
      if (finalText.trim()) {
        usedVoice = true;
        lastVoiceLang = resolveLang(finalText);
        send(finalText);
      } else if (live) {
        setTimeout(startListen, 250);
      }
    };
    r.start();
  }

  function startLive() {
    if (!SR) return add("Browser doesn't support voice.", "bot");
    warmPiper(); live = true;
    liveBtn.classList.add("on"); liveBtn.textContent = "⏹ Stop";
    startListen();
  }
  
  function stopLive() {
    live = false; stopListen(); stopSpeaking();
    liveBtn.classList.remove("on"); liveBtn.textContent = "📞 Live Chat";
    setStatus("Ask by text or voice");
  }
  
  liveBtn.onclick = () => (live ? stopLive() : startLive());

  // --- Send Message to Worker ---
  async function send(text) {
    text = (text || "").trim();
    if (!text || busy) return;
    busy = true; stopListen(); add(text, "me"); input.value = "";
    
    let lang = usedVoice ? lastVoiceLang : resolveLang(text);
    if ((live || usedVoice) && lang === "roman") lang = "ur";
    const wasVoice = usedVoice;
    usedVoice = false; chatLang = lang;

    const wait = add("...", "bot"); setStatus("Thinking...");

    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.slice(-8),
          english: lang === "en",
          lang: lang,
          lead: { active: !leadState.saved, name: leadState.name, phone: leadState.phone }
        })
      });
      
      const data = await r.json();
      if (!r.ok || !data.reply) throw new Error("bad");
      
      wait.textContent = data.reply;
      if (lang === "ur") wait.classList.add("rtl");
      
      history.push({ role: "user", content: text }, { role: "assistant", content: data.reply });
      if (data.lead) {
        if (data.lead.name) leadState.name = data.lead.name;
        if (data.lead.phone) leadState.phone = data.lead.phone;
        if (data.lead.name && data.lead.phone && !leadState.saved) {
          leadState.saved = true;
          fetch(LEAD_API, { method: "POST", body: JSON.stringify(leadState) });
        }
      }
    } catch (e) {
      wait.textContent = lang === "ur" ? "معذرت، میں ابھی جواب نہیں دے سکتی۔" : "Sorry, I can't answer right now.";
    }
    
    msgs.scrollTop = msgs.scrollHeight;
    busy = false;
    
    if (live || wasVoice) {
      speak(wait.textContent, lang, () => { if (live) startListen(); else setStatus("Ask by text or voice"); });
    } else {
      setStatus("Ask by text or voice");
    }
  }

  // --- Mic Button ---
  $("pxSend").onclick = () => send(input.value);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(input.value); });

  if (!SR) {
    mic.style.display = "none"; liveBtn.style.display = "none";
  } else {
    mic.onclick = () => {
      if (live) return;
      if (rec) { stopListen(); return; }
      warmPiper();
      const r = new SR(); rec = r;
      r.lang = LISTEN_LANG_MAP[langSel.value === "auto" ? lastVoiceLang : langSel.value] || "en-IN";
      r.interimResults = false;
      r.onstart = () => mic.classList.add("on");
      r.onend = () => { mic.classList.remove("on"); if (rec === r) rec = null; };
      r.onresult = (e) => {
        usedVoice = true;
        const t = e.results[0][0].transcript;
        lastVoiceLang = resolveLang(t);
        send(t);
      };
      r.start();
    };
  }

  // --- Open/Close ---
  $("pxBtn").onclick = () => { box.classList.toggle("open"); if (box.classList.contains("open")) { input.focus(); warmPiper(); } else stopLive(); };
  $("pxClose").onclick = () => { box.classList.remove("open"); stopLive(); };
  langSel.onchange = () => { if (speaking) stopSpeaking(); };

  if (synth) { synth.getVoices(); synth.onvoiceschanged = () => synth.getVoices(); }
})();
