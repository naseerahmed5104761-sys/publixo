/* ============================================================
   PubliXo — header.js
   Contains the full header markup, its CSS, and all navbar
   behavior. Injecting <script src="header.js"> anywhere in the
   page is enough — it builds the navbar automatically.
   ============================================================ */

(function () {
    'use strict';

    /* ---------- 1. HEADER HTML ---------- */
    const HEADER_HTML = `
        <nav class="navbar" id="navbar">
            <div class="nav-container">
                <a href="index.html" class="logo">
                    <img src="https://i.postimg.cc/RZFksC27/logo.jpg" alt="PubliXo Logo" class="logo-img">
                    <span class="logo-text">Publi<span class="blue">X</span><span class="gold">o</span></span>
                </a>

                <ul class="nav-links" id="navLinks">
                    <li><a href="index.html">Home</a></li>

                    <li class="dropdown">
                        <a href="index.html#services" class="dropdown-toggle">
                            Web Development <i class="fas fa-chevron-down"></i>
                        </a>
                        <ul class="dropdown-menu">
                            <li><a href="wordpress-development.html">WordPress Development</a></li>
                            <li><a href="ai-chatbot-assistant.html">AI Chatbot Assistant</a></li>
                            <li><a href="custom-web-development.html">Custom Web Development</a></li>
                            <li><a href="ecommerce-development.html">E-Commerce Development</a></li>
                            <li><a href="wordpress-redesign.html">WordPress Redesign</a></li>
                            <li><a href="speed-optimization.html">Website Speed Optimization</a></li>
                            <li><a href="website-maintenance.html">Website Maintenance</a></li>
                            <li><a href="dynamic-qr-code.html">Dynamic QR Code Service</a></li>
                        </ul>
                    </li>

                    <li class="dropdown">
                        <a href="index.html#services" class="dropdown-toggle">
                            Digital Marketing <i class="fas fa-chevron-down"></i>
                        </a>
                        <ul class="dropdown-menu">
                            <li><a href="meta-ads-management.html">Meta Ads Management</a></li>
                            <li><a href="social-media-management.html">Social Media Management</a></li>
                            <li><a href="digital-marketing.html">Digital Marketing</a></li>
                            <li><a href="ai-chatbot-assistant.html">AI Chatbot Assistant</a></li>
                        </ul>
                    </li>

                    <li class="dropdown">
                        <a href="index.html#services" class="dropdown-toggle">
                            Creative Services <i class="fas fa-chevron-down"></i>
                        </a>
                        <ul class="dropdown-menu">
                            <li><a href="social-media-designs.html">Social Media Designs</a></li>
                            <li><a href="ad-creatives.html">Ad Creatives</a></li>
                            <li><a href="business-graphics.html">Business Graphics</a></li>
                        </ul>
                    </li>

                    <li><a href="index.html#contact">Contact</a></li>
                    <li>
                        <a href="https://wa.me/923015394177" class="nav-cta" target="_blank">
                            <i class="fab fa-whatsapp"></i> Get a Quote
                        </a>
                    </li>
                </ul>

                <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle menu">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </nav>
    `;

    /* ---------- 2. HEADER CSS ---------- */
    const HEADER_CSS = `
        .navbar {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 1000;
            background: rgba(10, 15, 30, 0.85);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(245, 158, 11, 0.15);
            transition: all 0.3s ease;
        }

        .navbar.scrolled {
            box-shadow: 0 4px 30px rgba(0,0,0,0.5);
            border-bottom-color: rgba(245, 158, 11, 0.3);
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 76px;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            font-weight: 800;
            font-size: 1.4rem;
            color: white;
            letter-spacing: -0.5px;
        }

        .logo-img {
            width: 48px; height: 48px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(245, 158, 11, 0.4);
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
            transition: all 0.3s ease;
        }

        .logo:hover .logo-img {
            box-shadow: 0 0 30px rgba(245, 158, 11, 0.6);
            transform: scale(1.05);
        }

        .logo-text { font-family: 'Cinzel', serif; font-weight: 800; }
        .logo-text .blue { color: #60a5fa; }
        .logo-text .gold { color: #fbbf24; }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 4px;
            list-style: none;
        }

        .nav-links > li > a {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            text-decoration: none;
            color: #cbd5e1;
            font-weight: 500;
            font-size: 0.88rem;
            padding: 8px 14px;
            border-radius: 8px;
            transition: all 0.2s ease;
            white-space: nowrap;
        }

        .nav-links > li > a:hover {
            color: #fbbf24;
            background: rgba(245, 158, 11, 0.08);
        }

        .dropdown { position: relative; }

        .dropdown-toggle i {
            font-size: 0.65rem;
            transition: transform 0.3s ease;
        }

        .dropdown:hover .dropdown-toggle i { transform: rotate(180deg); }

        .dropdown-menu {
            position: absolute;
            top: 100%; left: 0;
            min-width: 260px;
            background: rgba(10, 15, 30, 0.98);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(245, 158, 11, 0.2);
            border-radius: 12px;
            padding: 8px;
            list-style: none;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s ease;
            z-index: 100;
        }

        .dropdown:hover .dropdown-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .dropdown-menu li a {
            display: block;
            padding: 10px 14px;
            color: #cbd5e1;
            text-decoration: none;
            font-size: 0.85rem;
            border-radius: 8px;
            transition: all 0.2s ease;
        }

        .dropdown-menu li a:hover {
            color: #fbbf24;
            background: rgba(245, 158, 11, 0.1);
            padding-left: 18px;
        }

        .nav-cta {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
            color: #0a0f1e !important;
            padding: 10px 22px !important;
            border-radius: 50px !important;
            font-weight: 700 !important;
            font-size: 0.88rem;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 20px rgba(245, 158, 11, 0.35);
            white-space: nowrap;
        }

        .nav-cta:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(245, 158, 11, 0.55) !important;
            color: #0a0f1e !important;
            background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%) !important;
        }

        .mobile-toggle {
            display: none;
            background: none; border: none;
            font-size: 1.5rem;
            color: #fbbf24;
            cursor: pointer;
            padding: 8px;
        }

        @media (max-width: 1024px) {
            .nav-links > li > a { font-size: 0.82rem; padding: 8px 10px; }
            .nav-cta { padding: 9px 16px !important; font-size: 0.8rem; }
        }

        @media (max-width: 900px) {
            .nav-links {
                display: none;
                position: absolute;
                top: 76px; left: 0; right: 0;
                background: rgba(10, 15, 30, 0.99);
                backdrop-filter: blur(20px);
                flex-direction: column;
                align-items: stretch;
                padding: 16px 24px 24px;
                border-bottom: 1px solid rgba(245, 158, 11, 0.2);
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                gap: 4px;
                max-height: calc(100vh - 76px);
                overflow-y: auto;
            }

            .nav-links.active { display: flex; }

            .nav-links > li > a {
                width: 100%;
                padding: 12px 16px;
                color: #cbd5e1;
                justify-content: flex-start;
            }

            .dropdown-toggle {
                color: #fbbf24 !important;
                font-weight: 700 !important;
                font-size: 0.75rem !important;
                text-transform: uppercase;
                letter-spacing: 2px;
                padding: 16px 8px 8px !important;
                pointer-events: none;
                background: transparent !important;
                border-bottom: 1px solid rgba(245, 158, 11, 0.15);
                margin-bottom: 4px;
            }

            .dropdown-toggle i { display: none; }

            .dropdown-menu {
                position: static !important;
                opacity: 1 !important;
                visibility: visible !important;
                transform: none !important;
                box-shadow: none !important;
                background: transparent !important;
                border: none !important;
                padding: 0 0 8px 0 !important;
                margin: 0 !important;
                min-width: auto !important;
                max-height: none !important;
                overflow: visible !important;
                display: block !important;
            }

            .dropdown-menu li a {
                padding: 9px 16px 9px 24px;
                font-size: 0.85rem;
                color: #94a3b8;
                border-left: 2px solid rgba(245, 158, 11, 0.2);
                margin-left: 8px;
                display: block;
                border-radius: 0 8px 8px 0;
            }

            .dropdown-menu li a:hover,
            .dropdown-menu li a:active {
                color: #fbbf24;
                background: rgba(245, 158, 11, 0.08);
                border-left-color: #f59e0b;
                padding-left: 28px;
            }

            .nav-cta {
                width: 100%;
                justify-content: center;
                margin-top: 12px;
            }

            .mobile-toggle { display: block; }
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

    function mountHeader() {
        // Create a container at the very top of <body> if it doesn't exist
        let placeholder = document.getElementById('publixo-header');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.id = 'publixo-header';
            document.body.insertBefore(placeholder, document.body.firstChild);
        }
        placeholder.innerHTML = HEADER_HTML;
    }

    /* ---------- 4. Header behavior ---------- */
    function initHeaderBehavior() {
        const navbar = document.getElementById('navbar');
        const mobileToggle = document.getElementById('mobileToggle');
        const navLinks = document.getElementById('navLinks');
        if (!navbar || !mobileToggle || !navLinks) return;

        // Scroll effect
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 20);
        });

        // Mobile menu toggle
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        // Close menu on any real link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (link.classList.contains('dropdown-toggle')) return;
                navLinks.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-times');
            }
        });
    }

    /* ---------- 5. Boot ---------- */
    function boot() {
        mountHeader();
        injectCSS(HEADER_CSS, 'publixo-header-css');
        initHeaderBehavior();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
