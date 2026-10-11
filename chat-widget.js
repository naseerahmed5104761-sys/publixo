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
  const SPEAK_LANG_MAP  = { en: "en-US", roman: "en-IN", ur: "ur-PK", auto: "en-US" };

  let history = [], busy = false, speaking = false, live = false, rec = null,
      usedVoice = false, interimEl = null, speakToken = 0, lastVoiceLang = "en";

  // Lead capture state
  let userMsgs = 0, chatLang = "en";
  let leadStep = 0;   // 0 = not asked, 1 = waiting for name, 2 = waiting for phone, 3 = done / declined
  let leadAsks = 0, leadName = "", leadPhone = "";

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

  add("Hello! 👋 I am Sara, welcome to PubliXo. Ask me about websites, Meta Ads, social media marketing or dynamic QR codes.", "bot");

  /* ---------- Language detection ---------- */
  function detectLang(text) {
    if (/[\u0600-\u06FF]/.test(text)) return "ur";
    const romanUrdu = /\b(kya|kaise|kaisay|kitna|kitne|kahan|kab|kyun|kyu|nahi|nahin|hai|hain|ho|ka|ki|ke|ko|se|mein|me|ap|aap|tum|hum|mujhe|mera|meri|apka|apki|acha|theek|bhai|ji|kar|karo|karna|bata|batao|chahiye|milega|milegi|rate|kiya|kaam|banwana|banana|paisa|paise|kitni|banwa|chahta|chahti|chahye|batana|bataen)\b/i;
    if (romanUrdu.test(text)) return "roman";
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
    const code = (langCode || "en-US").toLowerCase();
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

    // --- Clean English: en-US / en-GB female, Indian accent nahi ---
    for (const group of [["en-us"], ["en-gb"], ["en-au", "en-ca"]]) {
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
    const speakLang = SPEAK_LANG_MAP[langCode] || "en-US";
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
      u.rate = langCode === "ur" ? 0.95 : 1;
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

  /* ---------- Lead capture (naam + number) ---------- */
  /* LEAD-HELPERS-START */
  const LEAD_TEXT = {
    askName: {
      en: "By the way, may I know your name so our team can follow up with you? (Type \"skip\" if you prefer not to.)",
      roman: "Waise, kya main aap ka naam jaan sakti hoon taake hamari team aap se rabta kar sake? (Na dena chahein to \"skip\" likh dein.)",
      ur: "ویسے، کیا میں آپ کا نام جان سکتی ہوں تاکہ ہماری ٹیم آپ سے رابطہ کر سکے؟ (اگر نہ دینا چاہیں تو \"skip\" کہہ دیں۔)",
    },
    askNameAgain: {
      en: "Great! Please tell me your name.",
      roman: "Zabardast! Meherbani karke apna naam bata dein.",
      ur: "بہت خوب! براہ کرم اپنا نام بتا دیں۔",
    },
    badName: {
      en: "Sorry, I didn't catch that. Could you tell me just your name?",
      roman: "Maazrat, samajh nahi aaya. Sirf apna naam bata dein.",
      ur: "معذرت، سمجھ نہیں آیا۔ صرف اپنا نام بتا دیں۔",
    },
    askPhone: {
      en: "Thanks, {name}! What's the best phone or WhatsApp number to reach you on? Our team will only use it to contact you about your enquiry.",
      roman: "Shukriya {name}! Aap ka phone ya WhatsApp number kya hai? Hamari team sirf aap se rabta karne ke liye use karegi.",
      ur: "شکریہ {name}! آپ کا فون یا واٹس ایپ نمبر کیا ہے؟ ہماری ٹیم صرف آپ سے رابطے کے لیے استعمال کرے گی۔",
    },
    badPhone: {
      en: "That number doesn't look right. Please enter a valid phone number, for example 0301 1234567.",
      roman: "Ye number theek nahi lag raha. Sahi phone number likhein, jaise 0301 1234567.",
      ur: "یہ نمبر درست نہیں لگ رہا۔ براہ کرم درست فون نمبر بتائیں، جیسے 0301 1234567۔",
    },
    thanks: {
      en: "Thank you, {name}! Our team will contact you soon. Feel free to ask me anything else.",
      roman: "Shukriya {name}! Hamari team jald aap se rabta karegi. Aap kuch aur bhi poochh sakte hain.",
      ur: "شکریہ {name}! ہماری ٹیم جلد آپ سے رابطہ کرے گی۔ آپ مزید کچھ بھی پوچھ سکتے ہیں۔",
    },
    failed: {
      en: "Thanks, {name}! I couldn't send your details just now. Please WhatsApp us on 0301 5394177 and we'll help right away.",
      roman: "Shukriya {name}! Abhi aap ki details nahi bhej saki. Meherbani karke 0301 5394177 par WhatsApp karein.",
      ur: "شکریہ {name}! ابھی آپ کی تفصیلات نہیں بھیج سکی۔ براہ کرم 0301 5394177 پر واٹس ایپ کریں۔",
    },
    declined: {
      en: "No problem at all! Feel free to ask me anything else.",
      roman: "Koi baat nahi! Aap kuch bhi poochh sakte hain.",
      ur: "کوئی بات نہیں! آپ مزید کچھ بھی پوچھ سکتے ہیں۔",
    },
  };

  const DECLINE = ["skip", "no", "nope", "nah", "no thanks", "no thank you", "not now", "later", "nahi", "nahin", "nai", "na",
    "abhi nahi", "abhi nahin", "rehne do", "نہیں", "نہ", "رہنے دیں", "چھوڑیں", "اسکپ"];
  const YES = ["yes", "yeah", "yep", "ok", "okay", "sure", "haan", "han", "ji", "jee", "haan ji", "جی", "ہاں"];

  const normAns = (t) => t.toLowerCase().replace(/[.!?؟،,۔]/g, "").trim();
  function isDecline(t) {
    const n = normAns(t);
    return DECLINE.includes(n) || n.startsWith("nahi ") || n.startsWith("no thanks") || n.startsWith("not now");
  }
  function isYes(t) { return YES.includes(normAns(t)); }

  function looksLikeQuestion(t) {
    if (/[?؟]/.test(t)) return true;
    if (t.trim().split(/\s+/).length > 5) return true;
    return /^(how|what|why|when|where|which|who|can|do|does|is|are|kya|kaise|kitna|kitne|kab|kyun|price|rate|cost)\b/i.test(t.trim());
  }

  function cleanName(t) {
    let n = t.trim()
      .replace(/^(my name is|name is|i am|i'm|im|this is|mera naam|mera name|naam|main|mai|میرا نام|میں)\s+/i, "")
      .replace(/\s+(hai|hy|ہے)$/i, "")
      .replace(/[^\p{L}\s.'-]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
    if (/[\d۰-۹٠-٩]/.test(t)) return "";          // naam mein number nahi hota
    if (n.length < 2 || n.length > 40) return "";
    if (n.split(" ").length > 4) return "";
    // English naam ka pehla harf bara
    n = n.replace(/\b([a-z])/g, (m) => m.toUpperCase());
    return n;
  }

  function extractDigits(t) {
    const map = { "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
                  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9" };
    const ascii = t.replace(/[۰-۹٠-٩]/g, (c) => map[c]);
    return { digits: ascii.replace(/\D/g, ""), plus: /^\s*\+/.test(ascii) };
  }

  function normalizePhone(d) {
    if (d.digits.length === 10 && d.digits[0] === "3") return "0" + d.digits;       // 3011234567 -> 03011234567
    if (d.digits.length === 12 && d.digits.startsWith("92")) return "+" + d.digits;  // 923011234567
    return (d.plus ? "+" : "") + d.digits;
  }
  const validPhone = (d) => d.digits.length >= 10 && d.digits.length <= 15;
  /* LEAD-HELPERS-END */

  function leadLang(wasVoice) {
    let l = langSel.value !== "auto" ? langSel.value : chatLang;
    if ((live || wasVoice) && l === "roman") l = "ur";
    return l;
  }

  function shouldAskLead() {
    if (leadStep >= 2) return false;                         // naam mil chuka ya done/declined
    if (leadAsks === 0) return userMsgs >= LEAD_AFTER;
    if (leadAsks === 1 && leadStep === 1) return userMsgs >= LEAD_AFTER * 2;  // ek dafa dobara
    return false;
  }

  // Bot ka jawab dikhao (aur live/voice mode mein bolo)
  function botSay(text, lang, wasVoice) {
    add(text, "bot");
    busy = false;
    if (live || wasVoice) speak(text, lang, () => { if (live) startListen(); else setStatus(IDLE); });
    else setStatus(IDLE);
  }

  async function submitLead() {
    try {
      const r = await fetch(LEAD_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
          lang: chatLang,
          page: location.href,
          chat: history.slice(-6),
        }),
      });
      return r.ok;
    } catch (e) {
      return false;
    }
  }

  // true = ye message naam/number ka jawab tha (AI ko nahi bhejna). false = normal sawal hai.
  async function handleLeadInput(text, wasVoice) {
    const l = leadLang(wasVoice);
    const T = (key) => LEAD_TEXT[key][l];

    if (isDecline(text)) {
      leadStep = 3;
      botSay(T("declined"), l, wasVoice);
      return true;
    }

    if (leadStep === 1) {
      if (looksLikeQuestion(text)) return false;
      if (isYes(text)) { botSay(T("askNameAgain"), l, wasVoice); return true; }
      const name = cleanName(text);
      if (!name) { botSay(T("badName"), l, wasVoice); return true; }
      leadName = name;
      leadStep = 2;
      botSay(T("askPhone").replace("{name}", name), l, wasVoice);
      return true;
    }

    if (leadStep === 2) {
      const d = extractDigits(text);
      if (!validPhone(d)) {
        if (looksLikeQuestion(text) && d.digits.length < 6) return false;
        botSay(T("badPhone"), l, wasVoice);
        return true;
      }
      leadPhone = normalizePhone(d);
      leadStep = 3;
      setStatus("Saving...");
      const ok = await submitLead();
      botSay(T(ok ? "thanks" : "failed").replace("{name}", leadName), l, wasVoice);
      return true;
    }
    return false;
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

    // Naam / number ka jawab? Ye AI ko nahi jata.
    if (leadStep === 1 || leadStep === 2) {
      if (await handleLeadInput(text, wasVoice)) return;
    }

    const wait = add("...", "bot");
    setStatus("Thinking...");
    chatLang = lang;

    let reply = "", ok = false;
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
      if (/[\u0600-\u06FF]/.test(reply)) wait.classList.add("rtl");
      history.push({ role: "user", content: text }, { role: "assistant", content: reply });
      ok = true;
      userMsgs++;   // sirf kamyab jawab wale sawal ginte hain
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
    busy = false;

    // 3 sawalon ke baad naam poochho (jawab ke saath hi)
    let spoken = reply;
    if (ok && shouldAskLead()) {
      const askText = LEAD_TEXT.askName[lang === "ur" ? "ur" : lang === "roman" ? "roman" : "en"];
      add(askText, "bot");
      leadStep = 1;
      leadAsks++;
      spoken = reply + " " + askText;
    }

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
  $("pxBtn").onclick = () => { box.classList.toggle("open"); if (box.classList.contains("open")) input.focus(); else stopLive(); };
  $("pxClose").onclick = () => { box.classList.remove("open"); stopLive(); };
  langSel.onchange = () => { if (speaking) stopSpeaking(); };

  if (synth) { synth.getVoices(); synth.onvoiceschanged = () => synth.getVoices(); }
  window.addEventListener("beforeunload", () => { stopSpeaking(); });
})();
