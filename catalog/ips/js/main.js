/**
 * IPS Initializer — v2
 * Waits for window.IPS + window._userdata, then initializes.
 */
(function () {
  if (window.__IPS_INITIALIZED__) {
    console.warn("[IPS] Already initialized, skipping.");
    return;
  }
  window.__IPS_INITIALIZED__ = true;

  // ─── Config ──────────────────────────────────────────────
  const TOKEN    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJob3N0bmFtZSI6InN0YWFyay5mb3J1bW90aW9uLmV1IiwiaWF0IjoxNzc1MTc4NDYzfQ.D3Ufs5H4qhDz7K2OmnOOMYwRHWMIxTKcDgmLsAPxDcc";
  const TIMEOUT  = 15000;
  const INTERVAL = 100;
  const BASE_URL = "https://ips.staarkinc.com";
  const V        = Date.now();
  // ─────────────────────────────────────────────────────────

  function injectAssets() {
    return new Promise((resolve, reject) => {
      // CSS — non-blocking, nu așteptăm după el
      const link  = document.createElement("link");
      link.rel    = "stylesheet";
      link.href   = `${BASE_URL}/ips-theme.css?v=${V}`;
      document.head.appendChild(link);

      // JS — așteptăm load înainte să continuăm
      const script = document.createElement("script");
      script.src   = `${BASE_URL}/ips.min.js?v=${V}`;
      script.onload  = resolve;
      script.onerror = () => reject(new Error("Failed to load ips.min.js"));
      document.head.appendChild(script);
    });
  }

  function isReady() {
    return !!window.IPS && !!window._userdata;
  }

  function initIPS({ fallback = false } = {}) {
    if (fallback) {
      console.warn("[IPS] Initializing without userdata (fallback).");
    }
	  
    IPS.register({
      modules: ["Notifications", "Navbar"],
      config: { debug: false },
    });
    IPS.init(TOKEN);
  }

  function waitForIPS() {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + TIMEOUT;
      const timer = setInterval(() => {
        if (isReady()) {
          clearInterval(timer);
          return resolve({ fallback: false });
        }
        if (Date.now() >= deadline) {
          clearInterval(timer);
          return reject(new Error("timeout"));
        }
      }, INTERVAL);
    });
  }

  // ─── Boot sequence ────────────────────────────────────────
  injectAssets()
    .then(() => waitForIPS())
    .then(({ fallback }) => initIPS({ fallback }))
    .catch((err) => {
      console.warn(`[IPS] ${err.message}`);
      if (window.IPS) {
        initIPS({ fallback: true });
      } else {
        console.error("[IPS] Script not loaded.");
      }
    });
})()
