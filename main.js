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

  // 4. Smooth Anchor Link Handler
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
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

  // 5. 5-Stage Manufacturing Process Video Showcase Controller
  const STEPS_DATA = [
    {
      badge: "STAGE 01 / 05 • 원자재 정밀 선삭",
      sub: "01. 대형 선반 가공 및 롤 코어 저널 정밀 절삭",
      text: "최대 8M 대형선반을 활용하여 0.005mm 이내 공차로 롤 바디와 저널부를 1차 정밀 가공합니다.",
    },
    {
      badge: "STAGE 02 / 05 • 고무 및 우레탄 라이닝",
      sub: "02. 고내마모 특수 우레탄/고무 고압 피복",
      text: "경도 Shore A 70~95° 균일 가류 공정으로 내마모성 및 내화학성을 극대화합니다.",
    },
    {
      badge: "STAGE 03 / 05 • 경질 크롬 도금 & 슈퍼피니싱",
      sub: "03. 고경도 크롬 전해도금 및 초정밀 경면 연삭",
      text: "경도 HV800 이상 크롬층을 형성하고 Ra 0.02µm 이하로 슈퍼피니싱 경면 연마합니다.",
    },
    {
      badge: "STAGE 04 / 05 • 동적 바란싱 & 0.001mm 검사",
      sub: "04. 고속 회전 다이내믹 밸런스 & 진원도 전수 검사",
      text: "ISO 1940 G0.4 기준 고속 회전 시 진동을 제로화하고 진원도 공차를 전수 검증합니다.",
    },
    {
      badge: "STAGE 05 / 05 • 산업 라인 장착 & 최종 납품",
      sub: "05. 광폭 필름/제지/2차전지 라인 장착 및 출고",
      text: "실제 고속 생산 라인에 최적화하여 24/7 품질 보증과 함께 안전하게 현장 납품합니다.",
    },
  ];

  let currentStep = 0;
  let isPlaying = true;
  let stepProgress = 0;
  const STEP_DURATION = 3800; // ms per step
  const UPDATE_INTERVAL = 30; // ms

  const slides = document.querySelectorAll(".process-slide");
  const fills = document.querySelectorAll(".segment-fill");
  const stepPills = document.querySelectorAll(".step-pill");
  const badgeEl = document.getElementById("processStepBadge");
  const subEl = document.getElementById("processSubtitle");
  const headingEl = document.getElementById("processHeading");
  const playBtn = document.getElementById("videoPlayBtn");
  const btnPrev = document.getElementById("btnPrevStep");
  const btnNext = document.getElementById("btnNextStep");
  const player = document.getElementById("processVideoPlayer");

  const renderStep = (index) => {
    currentStep = (index + STEPS_DATA.length) % STEPS_DATA.length;
    stepProgress = 0;

    // Update Slides
    slides.forEach((slide, idx) => {
      if (idx === currentStep) {
        slide.style.opacity = "1";
        slide.classList.add("active");
      } else {
        slide.style.opacity = "0";
        slide.classList.remove("active");
      }
    });

    // Update Progress Bars
    fills.forEach((fill, idx) => {
      if (idx < currentStep) {
        fill.style.width = "100%";
      } else if (idx === currentStep) {
        fill.style.width = "0%";
      } else {
        fill.style.width = "0%";
      }
    });

    // Update Text HUD
    const data = STEPS_DATA[currentStep];
    if (badgeEl) badgeEl.textContent = data.badge;
    if (subEl) subEl.textContent = data.sub;
    if (headingEl) headingEl.textContent = data.text;

    // Update Pills
    stepPills.forEach((pill, idx) => {
      if (idx === currentStep) {
        pill.className = "step-pill px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all active-step-pill bg-indigo-600 text-white border-indigo-400";
      } else {
        pill.className = "step-pill px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all bg-black/60 text-slate-400 border-white/10 hover:text-white";
      }
    });
  };

  // Video Loop
  setInterval(() => {
    if (!isPlaying) return;

    stepProgress += (UPDATE_INTERVAL / STEP_DURATION) * 100;
    if (fills[currentStep]) {
      fills[currentStep].style.width = `${Math.min(stepProgress, 100)}%`;
    }

    if (stepProgress >= 100) {
      renderStep(currentStep + 1);
    }
  }, UPDATE_INTERVAL);

  const togglePlayState = () => {
    isPlaying = !isPlaying;
    if (playBtn) {
      if (isPlaying) {
        playBtn.innerHTML = '<i data-lucide="pause" class="w-6 h-6 fill-current"></i>';
      } else {
        playBtn.innerHTML = '<i data-lucide="play" class="w-6 h-6 fill-current translate-x-0.5"></i>';
      }
      if (window.lucide) window.lucide.createIcons();
    }
  };

  playBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlayState();
  });

  player?.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest(".progress-bar-segment")) return;
    togglePlayState();
  });

  btnPrev?.addEventListener("click", (e) => {
    e.stopPropagation();
    renderStep(currentStep - 1);
  });

  btnNext?.addEventListener("click", (e) => {
    e.stopPropagation();
    renderStep(currentStep + 1);
  });

  document.querySelectorAll(".progress-bar-segment").forEach((seg) => {
    seg.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = parseInt(seg.getAttribute("data-target"), 10);
      renderStep(target);
    });
  });

  stepPills.forEach((pill) => {
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = parseInt(pill.getAttribute("data-jump"), 10);
      renderStep(target);
    });
  });

  // 6. Mode Switcher (5-Stage Step Explorer vs '준비 중입니다' Video Placeholder)
  const btnModeVideo = document.getElementById("btnModeVideo");
  const btnModeSteps = document.getElementById("btnModeSteps");
  const btnSwitchToSteps = document.getElementById("btnSwitchToSteps");
  const realVideoFrame = document.getElementById("realVideoFrame");
  const processVideoPlayer = document.getElementById("processVideoPlayer");

  const activateStepsMode = () => {
    btnModeSteps.className = "px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all bg-indigo-600 text-white shadow-sm flex items-center gap-1";
    btnModeVideo.className = "px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1";
    if (realVideoFrame) realVideoFrame.classList.add("hidden");
    if (processVideoPlayer) processVideoPlayer.classList.remove("hidden");
    isPlaying = true;
    renderStep(currentStep);
  };

  const activateVideoMode = () => {
    btnModeVideo.className = "px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all bg-indigo-600 text-white shadow-sm flex items-center gap-1";
    btnModeSteps.className = "px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1";
    if (realVideoFrame) realVideoFrame.classList.remove("hidden");
    if (processVideoPlayer) processVideoPlayer.classList.add("hidden");
    isPlaying = false;
  };

  btnModeSteps?.addEventListener("click", activateStepsMode);
  btnModeVideo?.addEventListener("click", activateVideoMode);
  btnSwitchToSteps?.addEventListener("click", activateStepsMode);

  renderStep(0);

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
  if (typeof VanillaTilt !== "undefined") {
    VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
      max: 8,
      speed: 400,
      glare: true,
      "max-glare": 0.15,
      perspective: 1000,
    });
  }

  // 9. Aceternity UI Mouse-Tracking Spotlight Glow Effect
  document.querySelectorAll(".spotlight-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  // 10. Interactive FAQ Accordion (shadcn/ui style)
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

  // 11. Quick Quote Estimation Calculator Modal with Confetti
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
