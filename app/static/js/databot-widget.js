(() => {
  if (window.__databotWidgetLoaded) return;
  window.__databotWidgetLoaded = true;

  const cfgScript = document.currentScript;
  const APP_URL = cfgScript.getAttribute('app-url');
  if (!APP_URL) { console.warn('app-url is required'); return; }
  const ICON_PATH = cfgScript.getAttribute('app-icon-path') || 'https://intellimenta.com/files/databot-widget-icon.png';
  const ICON_SIZE = parseInt(cfgScript.getAttribute('app-icon-size') || '72', 10);

  const TITLE = cfgScript.getAttribute('app-title') || 'DataBot';
  const COLOR = cfgScript.getAttribute('app-primary-color') || '#644883';
  const START_OPEN = (cfgScript.getAttribute('app-start-open') || 'false') === 'true';
  const HIDE_ON_PATH = cfgScript.getAttribute('app-hide-on-path') || '';

  if (HIDE_ON_PATH && location.pathname.match(new RegExp(HIDE_ON_PATH))) return;

  // Container
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.inset = 'auto 16px 16px auto';
  host.style.zIndex = '2147483647';
  host.setAttribute('aria-live', 'polite');
  document.body.appendChild(host);

  // Shadow root for style isolation
  const root = host.attachShadow({ mode: 'open' });

  root.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; }

      .btn {
        position: relative;
        width: var(--btn-size); height: var(--btn-size);
        border: none; 
        cursor: pointer;
        background: none;
        border-radius: 50px;
      }
      .btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
      .badge { position:absolute; top:-4px; right:-4px; background:#ff3b30; color:#fff; border-radius:999px; padding:2px 6px; font-size:12px; display:none; }

      .tooltip {
        position: absolute;
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        background: #333;
        color: #fff;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 1;
        transition: opacity 0.2s ease;
      }
      .tooltip.hidden {
        opacity: 0;
        pointer-events: none;
      }

      /* Panel wrapper to allow manual positioning / resizing */
      .panel-wrapper {
        position: fixed;
        /* anchor to bottom-right visually, but with left/top so we can shrink from top-left */
        left: calc(100vw - 490px - 15px);
        top: calc(100vh - 80px - 700px + 65px);
        width: 490px;
        height: 700px; max-height: calc(100vh - 120px);
        pointer-events: none;
      }

      .panel {
        position: absolute;
        inset: 0;
        background: #fff; border-radius: 3px;
        box-shadow: 0 16px 48px rgba(0,0,0,.22);
        display: grid; grid-template-rows: 48px 1fr;
        overflow: hidden; transform: translateY(12px); opacity: 0; visibility: hidden; pointer-events: auto;
        transition: transform .18s ease, opacity .18s ease, visibility .18s ease;
      }
      .panel.open { transform: translateY(0); opacity: 1; visibility: visible; }

      /* Resize handle in top-left corner */
      .resize-handle {
        position: absolute;
        width: 14px;
        height: 14px;
        top: 2px;
        left: -2px;
        cursor: nw-resize;
        z-index: 2;
        background: transparent;
      }

      .resize-handle::before,
      .resize-handle::after {
        content: '';
        position: absolute;
        width: 8px;
        height: 2px;
        background: ${COLOR};
        border-radius: 2px;
        opacity: 0.8;
        transform: rotate(-45deg);
        transform-origin: left center;
      }

      .resize-handle::before {
        top: 3px;
        left: 2px;
      }

      .resize-handle::after {
        top: 8px;
        left: 2px;
        width: 15px;
      }

      @media (max-width: 750px) {
        .panel-wrapper {
          right: 0; left: 0; bottom: 0; top: 0;
          width: 100%; height: 100%; max-width: 100vw; max-height: 100vh;
        }
        .panel {
          inset: 0;
          width: 100%; height: 100%;
          border-radius: 0;
        }
        .resize-handle {
          display: none;
        }
      }
      .hdr {
        display:flex; align-items:center; justify-content:space-between;
        padding: 0 10px; background: #f6f7f8; border-bottom: 1px solid #e9edf2;
      }
      .ttl { font-weight: 600; font-size: 14px; padding-left: 6px; }
      .ctl { display:flex; gap:4px; }
      .icon-btn { width:32px; height:32px; border:none; background:transparent; cursor:pointer; border-radius:8px; }
      .icon-btn:focus-visible { outline:2px solid ${COLOR}; outline-offset:2px; }
      .icon { width:100%; height:100%; display:block; object-fit:contain; }

      iframe {
        width: 100%; height: 100%; border: 0;
        background: #fff;
      }

      @media (prefers-reduced-motion: reduce) {
        .panel { transition: none; }
      }
    </style>
    <button id='widget-button' class="btn" aria-haspopup="dialog" aria-expanded="false" aria-label="${TITLE}">
      <span class="tooltip">Ask any analytical question -></span>
      <span class="badge" aria-hidden="true">1</span>
      <img class="icon" fill="none" src="${ICON_PATH}" alt="icon">
    </button>

    <div class="panel-wrapper">
      <section class="panel" role="dialog" aria-modal="true" aria-label="${TITLE}">
        <div class="resize-handle" aria-hidden="true"></div>
        <header class="hdr">
          <div class="ttl">${TITLE}</div>
          <div class="ctl">
            <button class="icon-btn" data-act="min" title="Minimize" aria-label="Minimize">
              <svg viewBox="0 0 24 24"><path d="M5 12h14" stroke="#111" stroke-width="2"/></svg>
            </button>
          </div>
        </header>
      </section>
    </div>
  `;

  const $ = (sel) => root.querySelector(sel);
  const btn = $('#widget-button');
  btn.style.setProperty('--btn-size', ICON_SIZE + 'px');
  const badge = $('.badge');
  const panel = $('.panel');
  const panelWrapper = $('.panel-wrapper');
  const resizeHandle = $('.resize-handle');

  // Hide tooltip on button click
  const tooltip = root.querySelector('.tooltip');
  const TOOLTIP_KEY = 'databotWidget.tooltipSeen';
  const markTooltipSeen = () => {
    try { localStorage.setItem(TOOLTIP_KEY, '1'); } catch {}
  };

  // On first load, hide tooltip if already seen
  try {
    if (localStorage.getItem(TOOLTIP_KEY) === '1' && tooltip) {
      tooltip.classList.add('hidden');
    }
  } catch {}

  btn.addEventListener('click', () => {
    if (tooltip && !tooltip.classList.contains('hidden')) {
      tooltip.classList.add('hidden');
      markTooltipSeen();
    }
  });

  // Track anchor offsets (distance from bottom-right)
  let anchorRight = 15;
  let anchorBottom = 15;

  // After layout, capture initial offsets
  setTimeout(() => {
    const rect = panelWrapper.getBoundingClientRect();
    anchorRight = window.innerWidth - rect.right;
    anchorBottom = window.innerHeight - rect.bottom;
  }, 0);

  let frame = null;
  let open = false;
  let trapFirst = null, trapLast = null;

  function ensureFrame() {
    if (frame) return;
    frame = document.createElement('iframe');
    frame.setAttribute('title', TITLE);
    frame.setAttribute('allow', 'clipboard-write; microphone; camera; geolocation');
    frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    frame.loading = 'lazy';
    frame.src = APP_URL;
    panel.appendChild(frame);

    // Example postMessage handshake
    window.addEventListener('message', (e) => {
      // Optional origin check if you serve DataBot from a known origin
      // if (new URL(APP_URL).origin !== e.origin) return;
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'databot.unread') {
        if (e.data.count > 0 && !open) { badge.style.display = 'inline-block'; badge.textContent = String(e.data.count); }
        else { badge.style.display = 'none'; }
      }
      if (e.data.type === 'databot.close') toggle(false);
      if (e.data.type === 'databot.open') toggle(true);
    });
  }

  function trapFocus() {
    const focusables = Array.from(panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
    trapFirst = focusables[0];
    trapLast = focusables[focusables.length - 1];
    panel.addEventListener('keydown', (ev) => {
      if (ev.key === 'Tab' && focusables.length > 1) {
        if (ev.shiftKey && document.activeElement === trapFirst) { trapLast.focus(); ev.preventDefault(); }
        else if (!ev.shiftKey && document.activeElement === trapLast) { trapFirst.focus(); ev.preventDefault(); }
      }
      if (ev.key === 'Escape') toggle(false);
    });
  }

  // Resize from top-left corner
  let resizing = false;
  let startX = 0, startY = 0;
  let startWidth = 0, startHeight = 0;
  let startLeft = 0, startTop = 0;

  const MIN_WIDTH = 465;
  const MIN_HEIGHT = 650;
  const MAX_WIDTH = 750;
  let MAX_HEIGHT = window.innerHeight - 120; // was const, now mutable

  function onResizePointerMove(ev) {
    if (!resizing) return;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;

    let newWidth = startWidth - dx;
    let newHeight = startHeight - dy;

    newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH));
    newHeight = Math.max(MIN_HEIGHT, Math.min(newHeight, MAX_HEIGHT));

    let newLeft = startLeft + (startWidth - newWidth);
    let newTop = startTop + (startHeight - newHeight);

    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - newWidth));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - newHeight));

    panelWrapper.style.width = newWidth + 'px';
    panelWrapper.style.height = newHeight + 'px';
    panelWrapper.style.left = newLeft + 'px';
    panelWrapper.style.top = newTop + 'px';
  }

  function stopResizing(ev) {
    if (!resizing) return;
    resizing = false;

    // Release pointer capture
    try { resizeHandle.releasePointerCapture(ev.pointerId); } catch {}
    // Restore selection
    document.documentElement.style.userSelect = '';
    document.body.style.userSelect = '';

    // Update anchor offsets after manual resize so future window resizes keep new bottom-right
    const rect = panelWrapper.getBoundingClientRect();
    anchorRight = window.innerWidth - rect.right;
    anchorBottom = window.innerHeight - rect.bottom;

    // Remove listeners attached to handle
    resizeHandle.removeEventListener('pointermove', onResizePointerMove);
    resizeHandle.removeEventListener('pointerup', stopResizing);
    resizeHandle.removeEventListener('pointercancel', stopResizing);
  }

  if (resizeHandle) {
    resizeHandle.addEventListener('pointerdown', (ev) => {
      // Only react to primary button/finger
      if (ev.button !== 0 && ev.pointerType === 'mouse') return;
      ev.preventDefault();

      const rect = panelWrapper.getBoundingClientRect();
      startX = ev.clientX;
      startY = ev.clientY;
      startWidth = rect.width;
      startHeight = rect.height;
      startLeft = rect.left;
      startTop = rect.top;

      resizing = true;

      // Prevent selection while resizing
      document.documentElement.style.userSelect = 'none';
      document.body.style.userSelect = 'none';

      // Capture pointer so events keep flowing even over other iframes
      try { resizeHandle.setPointerCapture(ev.pointerId); } catch {}

      // Listen on the handle for captured events
      resizeHandle.addEventListener('pointermove', onResizePointerMove);
      resizeHandle.addEventListener('pointerup', stopResizing);
      resizeHandle.addEventListener('pointercancel', stopResizing);
    });
  }

  function toggle(next) {
    open = typeof next === 'boolean' ? next : !open;
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      ensureFrame();
      badge.style.display = 'none';
      setTimeout(() => {
        const minBtn = panel.querySelector('[data-act="min"]');
        minBtn && minBtn.focus();
      }, 10);
      trapFocus();
      // Notify iframe it is visible
      frame?.contentWindow?.postMessage({ type: 'databot.visibility', visible: true }, '*');
    } else {
      btn.focus();
      frame?.contentWindow?.postMessage({ type: 'databot.visibility', visible: false }, '*');
    }
    if (open && tooltip && !tooltip.classList.contains('hidden')) {
      tooltip.classList.add('hidden');
      markTooltipSeen();
    }
  }

  btn.addEventListener('click', () => toggle());
  panel.querySelector('[data-act="min"]').addEventListener('click', () => toggle(false));

  if (START_OPEN) toggle(true);

  // Re-anchor on window resize
  window.addEventListener('resize', () => {
    // Skip if mobile layout (media query handles full-screen)
    if (window.innerWidth <= 640) return;
    MAX_HEIGHT = window.innerHeight - 120;
    const rect = panelWrapper.getBoundingClientRect();
    const width = rect.width;
    let height = rect.height;
    if (height > MAX_HEIGHT) {
      height = MAX_HEIGHT;
      panelWrapper.style.height = height + 'px';
    }
    // Recompute left/top from stored bottom-right offsets
    let left = window.innerWidth - width - anchorRight;
    let top = window.innerHeight - height - anchorBottom;
    // Clamp
    left = Math.max(0, Math.min(left, window.innerWidth - width));
    top = Math.max(0, Math.min(top, window.innerHeight - height));
    panelWrapper.style.left = left + 'px';
    panelWrapper.style.top = top + 'px';
  });

  // Optional: expose a tiny API for host pages
  window.DataBotWidget = {
    open: () => toggle(true),
    close: () => toggle(false),
    toggle: () => toggle(),
    send: (payload) => frame?.contentWindow?.postMessage({ type: 'databot.client', payload }, '*'),
  };
})();