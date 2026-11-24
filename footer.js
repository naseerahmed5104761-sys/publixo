/* ============================================================
   PubliXo — footer.js (Updated with Privacy Policy link)
   ============================================================ */

(function () {
    'use strict';

    /* ---------- 1. FOOTER HTML ---------- */
    const FOOTER_HTML = `
        <footer class="footer">
            <div class="footer-container">
                <div class="footer-grid">
                    <div class="footer-brand">
                        <a href="index.html" class="logo">
                            <img src="https://i.postimg.cc/RZFksC27/logo.jpg" alt="PubliXo Logo" class="logo-img">
                            <span class="logo-text">Publi<span class="blue">X</span><span class="gold">o</span></span>
                        </a>
                        <p>
                            Professional Web Development, WordPress solutions, Meta Ads, Social Media Management, Digital Marketing, and AI Chatbot services designed to help your business grow online.
                        </p>
                    </div>
                    <div>
                        <h4>Web Development</h4>
                        <ul>
                            <li><a href="wordpress-development.html">WordPress Development</a></li>
                            <li><a href="ai-chatbot-assistant.html">AI Chatbot Assistant</a></li>
                            <li><a href="custom-web-development.html">Custom Web Development</a></li>
                            <li><a href="ecommerce-development.html">E-Commerce</a></li>
                            <li><a href="wordpress-redesign.html">WordPress Redesign</a></li>
                            <li><a href="speed-optimization.html">Speed Optimization</a></li>
                            <li><a href="dynamic-qr-code.html">Dynamic QR Code</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Digital Marketing</h4>
                        <ul>
                            <li><a href="meta-ads-management.html">Meta Ads Management</a></li>
                            <li><a href="social-media-management.html">Social Media Management</a></li>
                            <li><a href="digital-marketing.html">Digital Marketing</a></li>
                            <li><a href="ai-chatbot-assistant.html">AI Chatbot Assistant</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Creative Services</h4>
                        <ul>
                            <li><a href="social-media-designs.html">Social Media Designs</a></li>
                            <li><a href="ad-creatives.html">Ad Creatives</a></li>
                            <li><a href="business-graphics.html">Business Graphics</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2026 PubliXo. All rights reserved. <a href="/privacy-policy.html" class="footer-privacy-link">Privacy Policy</a></p>
                    <span class="tagline">Your Vision. Our Development.</span>
                    <div class="footer-social">
                        <a href="https://wa.me/923015394177" target="_blank" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                        <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>
        </footer>
    `;

    /* ---------- 2. FOOTER CSS ---------- */
    const FOOTER_CSS = `
        .footer {
            background: #060a14;
            padding: 60px 24px 30px;
            color: #64748b;
            border-top: 1px solid rgba(245, 158, 11, 0.1);
            font-family: 'Inter', -apple-system, sans-serif;
        }

        .footer-container { max-width: 1200px; margin: 0 auto; }

        .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 48px;
            margin-bottom: 48px;
        }

        .footer-brand .logo { color: white; margin-bottom: 18px; }

        .footer-brand .logo-img {
            width: 48px; height: 48px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(245, 158, 11, 0.4);
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
        }

        .footer-brand .logo-text { font-family: 'Cinzel', serif; font-weight: 800; }
        .footer-brand .logo-text .blue { color: #60a5fa; }
        .footer-brand .logo-text .gold { color: #fbbf24; }

        .footer-brand p {
            font-size: 0.86rem;
            line-height: 1.8;
            max-width: 300px;
            color: #64748b;
        }

        .footer h4 {
            color: #fbbf24;
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 22px;
        }

        .footer ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .footer ul a {
            color: #64748b;
            text-decoration: none;
            font-size: 0.86rem;
            transition: all 0.2s ease;
        }

        .footer ul a:hover { color: #fbbf24; padding-left: 4px; }

        .footer-bottom {
            border-top: 1px solid rgba(245, 158, 11, 0.1);
            padding-top: 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }

        .footer-bottom p { font-size: 0.82rem; margin: 0; }

        /* ===== NEW: Privacy Policy link styling ===== */
        .footer-privacy-link {
            color: #fbbf24;
            text-decoration: none;
            margin-left: 6px;
            padding-left: 10px;
            border-left: 1px solid rgba(245, 158, 11, 0.25);
            transition: color 0.2s ease;
        }

        .footer-privacy-link:hover {
            color: #f59e0b;
            text-decoration: underline;
        }

        .footer-bottom .tagline {
            font-family: 'Cinzel', serif;
            font-style: italic;
            color: #d97706;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
        }

        .footer-social { display: flex; gap: 12px; }

        .footer-social a {
            width: 40px; height: 40px;
            border-radius: 12px;
            background: rgba(245, 158, 11, 0.06);
            border: 1px solid rgba(245, 158, 11, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            text-decoration: none;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .footer-social a:hover {
            background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
            border-color: #f59e0b;
            color: #0a0f1e;
            transform: translateY(-3px);
            box-shadow: 0 4px 20px rgba(245, 158, 11, 0.35);
        }

        @media (max-width: 1024px) {
            .footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
        }

        @media (max-width: 768px) {
            .footer-grid { grid-template-columns: 1fr; gap: 32px; }
            .footer-bottom { flex-direction: column; text-align: center; }
            .footer-privacy-link { display: block; margin-left: 0; padding-left: 0; border-left: none; margin-top: 6px; }
        }
    `;

    /* ---------- 3. Helpers ---------- */
    function injectCSS(css, id) {
        if (document.getElementById(id)) return;
        const style = document.createElement('style');
        style.id = id;
        style.textContent = css;
        document.head.appendChild(style);
    }

    function mountFooter() {
        let placeholder = document.getElementById('publixo-footer');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.id = 'publixo-footer';
            document.body.appendChild(placeholder);
        }
        placeholder.innerHTML = FOOTER_HTML;
    }

    /* ---------- 4. Boot ---------- */
    function boot() {
        mountFooter();
        injectCSS(FOOTER_CSS, 'publixo-footer-css');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
