/**
 * 승지정밀산업롤 메인 인터랙션 스크립트
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Spline 3D Watermark & Logo Purge
  const splineViewer = document.querySelector("spline-viewer");
  if (splineViewer) {
    const cleanSplineShadow = () => {
      const shadow = splineViewer.shadowRoot;
      if (!shadow) return;

      // Inject permanent stylesheet to hide badges and links
      if (!shadow.querySelector("#hide-spline-watermark")) {
        const style = document.createElement("style");
        style.id = "hide-spline-watermark";
        style.textContent = `
          #logo, a[href*="spline.design"], #watermark, #badge, [class*="watermark"] {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            position: absolute !important;
            width: 0 !important;
            height: 0 !important;
            left: -9999px !important;
            top: -9999px !important;
          }
          #container, canvas, #canvas3d, .canvas-container {
            background: transparent !important;
            background-color: transparent !important;
          }
        `;
        shadow.appendChild(style);
      }

      // Remove existing badge/link elements
      const badEls = shadow.querySelectorAll('#logo, a[href*="spline.design"], #watermark, #badge');
      badEls.forEach((el) => el.remove());

      // Override Three.js WebGL background and clearAlpha to eliminate solid gray canvas
      try {
        const app = splineViewer._spline || splineViewer.spline || splineViewer._app;
        if (app) {
          const scene = app._scene || app.scene;
          const renderer = app._renderer || app.renderer;
          if (scene && scene.background) {
            scene.background = null;
          }
          if (renderer) {
            renderer.setClearColor(0x000000, 0);
            renderer.setClearAlpha(0);
          }
        }
      } catch (e) {}
    };

    // Run repeatedly as the Spline 3D assets finish downloading
    const pollInterval = setInterval(cleanSplineShadow, 80);
    setTimeout(() => clearInterval(pollInterval), 8000);

    splineViewer.addEventListener("load", cleanSplineShadow);
    splineViewer.addEventListener("load-complete", cleanSplineShadow);

    if (splineViewer.shadowRoot) {
      const obs = new MutationObserver(cleanSplineShadow);
      obs.observe(splineViewer.shadowRoot, { childList: true, subtree: true });
    }
  }

  // 3. Floating Navbar Scroll Effect
  const navPill = document.querySelector(".nav-pill");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navPill?.classList.add("shadow-2xl", "bg-surface-card/90");
    } else {
      navPill?.classList.remove("shadow-2xl", "bg-surface-card/90");
    }
  });

  // 4. Mobile Navigation Drawer
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobileMenu");

  const setMobileMenuState = (isOpen) => {
    if (!mobileMenuToggle || !mobileMenu) return;

    mobileMenu.hidden = !isOpen;
    mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
    mobileMenuToggle.setAttribute("aria-label", isOpen ? "모바일 메뉴 닫기" : "모바일 메뉴 열기");
    mobileMenuToggle.innerHTML = `<i data-lucide="${isOpen ? "x" : "menu"}" class="w-5 h-5"></i>`;

    if (window.lucide) window.lucide.createIcons();
  };

  mobileMenuToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    setMobileMenuState(mobileMenu?.hidden ?? true);
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMobileMenuState(false));
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth < 768 && navPill && !navPill.contains(event.target)) {
      setMobileMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMobileMenuState(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) setMobileMenuState(false);
  });

  // 5. Smooth Anchor Link Handler
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      if (mobileMenu?.contains(this)) setMobileMenuState(false);
      const targetId = this.getAttribute("href");
      if (targetId && targetId !== "#") {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });
  });

  // 6. Continuous manufacturing process video controller
  const processSequenceVideo = document.getElementById("processSequenceVideo");

  if (processSequenceVideo) {
    processSequenceVideo.muted = true;
    processSequenceVideo.loop = true;
    processSequenceVideo.playsInline = true;

    const keepProcessSequencePlaying = () => {
      if (!processSequenceVideo.paused && !processSequenceVideo.ended) return;
      const playRequest = processSequenceVideo.play();
      if (playRequest?.catch) playRequest.catch(() => {});
    };

    processSequenceVideo.addEventListener("loadeddata", keepProcessSequencePlaying);
    processSequenceVideo.addEventListener("canplay", keepProcessSequencePlaying);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) keepProcessSequencePlaying();
    });
    keepProcessSequencePlaying();
  }

  // 7. Lenis Smooth Inertia Scroll Initialization (@studio-freight/lenis)
  if (typeof Lenis !== "undefined") {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // 8. Vanilla-Tilt 3D Perspective Gyro Cards
  if (typeof VanillaTilt !== "undefined" && window.matchMedia("(min-width: 768px)").matches) {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
      max: 8,
      speed: 400,
      glare: true,
      "max-glare": 0.15,
      perspective: 1000,
    });
  }

  // 10. Aceternity UI Mouse-Tracking Spotlight Glow Effect
  document.querySelectorAll(".spotlight-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  // 11. Interactive FAQ Accordion (shadcn/ui style)
  document.querySelectorAll(".faq-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const content = toggle.nextElementSibling;
      const isOpen = !content.classList.contains("hidden");

      // Close all others
      document.querySelectorAll(".faq-content").forEach((c) => c.classList.add("hidden"));
      document.querySelectorAll(".faq-toggle").forEach((t) => t.classList.remove("active"));

      if (!isOpen) {
        content.classList.remove("hidden");
        toggle.classList.add("active");
      }
      if (window.lucide) window.lucide.createIcons();
    });
  });

  // 12. Quick Quote Estimation Calculator Modal with Confetti
  const modal = document.getElementById("quoteModal");
  const btnOpenModal = document.getElementById("btnOpenModal");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const form = document.getElementById("quoteCalculatorForm");
  const calcDia = document.getElementById("calcDia");
  const calcLen = document.getElementById("calcLen");
  const calcType = document.getElementById("calcType");
  const calcResultTime = document.getElementById("calcResultTime");

  const updateEstimate = () => {
    const dia = parseInt(calcDia?.value || 300, 10);
    const len = parseInt(calcLen?.value || 2500, 10);
    const type = calcType?.value || "cooling";

    let days = "3~5 영업일";
    if (len > 5000 || dia > 800) {
      days = "5~7 영업일 (초대형 정밀 가공)";
    } else if (type === "repair") {
      days = "2~4 영업일 (표면 긴급 재생)";
    }
    if (calcResultTime) calcResultTime.textContent = `예상 납기: 표준 ${days} 내 출고`;
  };

  calcDia?.addEventListener("input", updateEstimate);
  calcLen?.addEventListener("input", updateEstimate);
  calcType?.addEventListener("change", updateEstimate);

  const openModal = (e) => {
    e?.preventDefault();
    modal?.classList.add("modal-open");
    updateEstimate();
  };

  const closeModal = () => {
    modal?.classList.remove("modal-open");
  };

  btnOpenModal?.addEventListener("click", openModal);
  btnCloseModal?.addEventListener("click", closeModal);

  // Close modal when clicking outside
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Confetti Burst on Form Submit
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (typeof confetti === "function") {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#38bdf8", "#4f46e5", "#ffffff"],
      });
    }
    alert("견적 요청이 성공적으로 접수되었습니다! 담당 엔지니어가 즉시 도면 검토 후 유선 안내해 드립니다.");
    closeModal();
    form.reset();
  });

  console.log("승지정밀산업롤 웹사이트 인터랙션 및 오픈소스 UI 초기화 완료");
});
