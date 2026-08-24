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

  // 13. SJ Care Experimental Business Hub
  const planNames = {
    precision: "정기 연마 케어",
    predictive: "마모 수명 예측",
    sla: "특허 장비 프리미엄 케어",
  };
  const planKeyByName = Object.fromEntries(Object.entries(planNames).map(([key, value]) => [value, key]));
  const selectedPlanLabel = document.getElementById("selectedPlanLabel");
  const carePlanCards = [...document.querySelectorAll("[data-plan-card]")];

  const setSelectedCarePlan = (planName) => {
    const planKey = planKeyByName[planName] || "precision";
    if (selectedPlanLabel) selectedPlanLabel.textContent = planNames[planKey];
    carePlanCards.forEach((card) => {
      card.classList.toggle("is-selected", card.dataset.planCard === planKey);
    });
  };

  document.querySelectorAll(".plan-select").forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedCarePlan(button.dataset.plan);
      document.getElementById("care-dashboard")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  setSelectedCarePlan(selectedPlanLabel?.textContent || planNames.precision);

  const wearForm = document.getElementById("wearForm");
  const wearPercent = document.getElementById("wearPercent");
  const wearProgressBar = document.getElementById("wearProgressBar");
  const wearRecommendation = document.getElementById("wearRecommendation");
  const wearNextDate = document.getElementById("wearNextDate");

  const updateWearForecast = () => {
    const hours = Math.max(0, Number(document.getElementById("rollHours")?.value || 0));
    const temperature = Number(document.getElementById("rollTemp")?.value || 0);
    const pressure = Number(document.getElementById("rollPressure")?.value || 0);
    const surface = document.getElementById("rollSurface")?.value || "chrome";
    const baseLifeBySurface = { chrome: 7200, urethane: 5600, ptfe: 4800, rtv: 4200 };
    const baseLife = baseLifeBySurface[surface] || baseLifeBySurface.chrome;
    const stressFactor = 1 + Math.max(0, temperature - 80) / 700 + Math.max(0, pressure - 8) / 80;
    const estimatedLife = Math.max(1200, Math.round(baseLife / stressFactor));
    const percent = Math.min(99, Math.max(5, Math.round((hours / estimatedLife) * 100)));
    const remainingHours = Math.max(0, estimatedLife - hours);

    if (wearPercent) wearPercent.textContent = `${percent}%`;
    if (wearProgressBar) wearProgressBar.style.width = `${percent}%`;

    if (wearRecommendation) {
      wearRecommendation.textContent = remainingHours === 0
        ? "점검 시점 도달 · 재코팅 및 밸런스 일정을 바로 확인하세요"
        : `약 ${remainingHours.toLocaleString("ko-KR")}h 후 재코팅 점검 권장`;
    }

    const noticeDate = new Date();
    noticeDate.setMonth(noticeDate.getMonth() + Math.max(1, Math.ceil(remainingHours / 700)));
    const noticeYear = noticeDate.getFullYear();
    const noticeMonth = String(noticeDate.getMonth() + 1).padStart(2, "0");
    if (wearNextDate) wearNextDate.textContent = `예상 알림: ${noticeYear}.${noticeMonth}`;
  };

  wearForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    updateWearForecast();
  });
  ["rollHours", "rollTemp", "rollPressure"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", updateWearForecast);
  });
  document.getElementById("rollSurface")?.addEventListener("change", updateWearForecast);
  updateWearForecast();

  const membershipForm = document.getElementById("membershipForm");
  const membershipSaved = document.getElementById("membershipSaved");
  membershipForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const channels = [];
    if (document.getElementById("notifyKakao")?.checked) channels.push("카카오 알림톡");
    if (document.getElementById("notifyEmail")?.checked) channels.push("이메일 리포트");
    const membershipRecord = {
      plan: selectedPlanLabel?.textContent || planNames.precision,
      company: document.getElementById("memberCompany")?.value.trim() || "",
      contact: document.getElementById("memberContact")?.value.trim() || "",
      channels,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("sj-care-experiment-membership", JSON.stringify(membershipRecord));
    } catch (storageError) {
      console.info("로컬 저장소를 사용할 수 없어 현재 화면에서만 신청을 표시합니다.", storageError);
    }

    if (membershipSaved) {
      const channelText = channels.length ? channels.join(" · ") : "알림 채널 미선택";
      membershipSaved.textContent = `저장 완료 · ${membershipRecord.plan} · ${channelText}`;
    }
  });

  try {
    const savedMembership = JSON.parse(localStorage.getItem("sj-care-experiment-membership") || "null");
    if (savedMembership) {
      setSelectedCarePlan(savedMembership.plan);
      const savedCompany = document.getElementById("memberCompany");
      const savedContact = document.getElementById("memberContact");
      if (savedCompany) savedCompany.value = savedMembership.company || "";
      if (savedContact) savedContact.value = savedMembership.contact || "";
      if (membershipSaved) membershipSaved.textContent = `이 기기에 저장된 ${savedMembership.plan} 신청이 있습니다.`;
    }
  } catch (storageError) {
    console.info("저장된 SJ Care 실험 신청을 불러오지 못했습니다.", storageError);
  }

  // 14. Surface Treatment / Coating Selector
  const selectorForm = document.getElementById("selectorForm");
  const selectorRecommendation = document.getElementById("selectorRecommendation");
  const selectorReason = document.getElementById("selectorReason");
  const selectorTags = document.getElementById("selectorTags");
  const selectorProfiles = {
    heat: { label: "내열성", tag: "고온 공정" },
    wear: { label: "내마모성", tag: "반복 접촉" },
    release: { label: "이형성", tag: "비점착 표면" },
    chemical: { label: "내화학성", tag: "약품 대응" },
  };

  document.querySelectorAll(".selector-option").forEach((option) => {
    option.addEventListener("change", () => {
      option.closest(".selector-option-card")?.classList.toggle("is-checked", option.checked);
    });
  });

  selectorForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const selectedConditions = [...document.querySelectorAll(".selector-option:checked")].map((input) => input.value);
    const temperature = document.getElementById("selectorTemp")?.value || "low";
    const has = (condition) => selectedConditions.includes(condition);
    let recommendation = "경질 크롬 도금 & Super-Finishing";
    let reason = "반복 접촉과 표면 내구성이 중요한 생산라인에 적합한 기본 추천입니다.";
    let tags = ["HV800+", "Ra 0.02", "동적 밸런스"];

    if (has("release") && temperature === "high") {
      recommendation = "테프론(PTFE) 특수 코팅";
      reason = "고온 운전과 비점착성이 동시에 중요해 PTFE 계열 코팅을 우선 검토하는 조합입니다.";
      tags = ["저마찰", "고온 이형", "표면 균일도"];
    } else if (has("release") && (has("chemical") || has("heat"))) {
      recommendation = "PTFE / RTV 복합 사양 검토";
      reason = "이형성과 함께 열·약품 조건이 겹쳐 코팅 두께, 경화 방식, 모재 온도를 함께 확인해야 합니다.";
      tags = ["이형성", "열·약품 대응", "샘플 테스트"];
    } else if (has("wear") && has("chemical")) {
      recommendation = "경질 크롬 도금 + 내화학 상도";
      reason = "반복 접촉으로 인한 마모와 약품 접촉을 함께 고려한 다층 표면처리 상담이 필요합니다.";
      tags = ["내마모", "내화학", "다층 사양"];
    } else if (has("wear")) {
      recommendation = "경질 크롬 도금 & Super-Finishing";
      reason = "고속·반복 접촉 환경에서 외경 내구성과 낮은 표면 거칠기를 우선하는 조합입니다.";
      tags = ["HV800+", "Ra 0.02", "편마모 보정"];
    } else if (has("heat")) {
      recommendation = "RTV 실리콘 또는 열매체 히팅롤";
      reason = "온도 균일도와 열변형 관리가 핵심이므로 유로·자켓 구조와 표면 재질을 함께 설계합니다.";
      tags = ["열변형 관리", "자켓 유로", "온도 균일도"];
    } else if (has("chemical")) {
      recommendation = "RTV 실리콘 / 우레탄 피복";
      reason = "접촉 약품과 경도, 복원 탄성, 피복 두께를 확인한 뒤 내화학 피복 방향을 좁힙니다.";
      tags = ["내화학", "탄성 복원", "피복 두께"];
    }

    if (selectedConditions.length === 0) {
      tags = ["조건 추가", "기본 사양", "엔지니어 상담"];
    }
    if (selectorRecommendation) selectorRecommendation.textContent = recommendation;
    if (selectorReason) selectorReason.textContent = reason;
    if (selectorTags) {
      const conditionTags = selectedConditions.map((condition) => selectorProfiles[condition]?.tag).filter(Boolean);
      selectorTags.innerHTML = [...new Set([...tags, ...conditionTags])].map((tag) => `<span>${tag}</span>`).join("");
    }
  });

  // 15. CSS-based Roll Cutaway Viewer
  const rollStage = document.getElementById("rollStage");
  const viewerTitle = document.getElementById("viewerTitle");
  const viewerDescription = document.getElementById("viewerDescription");
  const viewerFeatures = document.getElementById("viewerFeatures");
  const viewerModes = ["cooling", "steam", "oil"];
  const viewerData = {
    cooling: {
      title: "정밀 자켓형 냉각 롤",
      description: "롤 바디 내부의 순환 재킷이 폭 방향 온도 편차를 줄이고, 외경 표면은 균일한 냉각 성능을 유지합니다.",
      features: ["이중 자켓 순환 구조", "열변형 최소화 설계", "동적 밸런싱 검사 연계"],
    },
    steam: {
      title: "스팀 히팅 롤",
      description: "스팀 통로의 압력과 응축수 배출을 고려해 빠른 승온과 안정적인 열전달을 목표로 하는 내부 구조입니다.",
      features: ["스팀 유입·응축수 배출 분리", "승온 응답성 중심 설계", "온도 센서 포인트 검토"],
    },
    oil: {
      title: "열매체 오일 순환 롤",
      description: "열매체 오일이 내부 유로를 순환하며 넓은 폭의 온도를 제어하고, 생산 조건에 맞춰 유량을 조정합니다.",
      features: ["열매체 유로 최적화", "폭 방향 온도 균일도", "누유 방지 씰 사양 검토"],
    },
  };

  const setViewerMode = (mode) => {
    const activeMode = viewerData[mode] ? mode : "cooling";
    viewerModes.forEach((viewerMode) => rollStage?.classList.toggle(`mode-${viewerMode}`, viewerMode === activeMode));
    document.querySelectorAll(".viewer-mode").forEach((button) => {
      button.classList.toggle("active", button.dataset.viewerMode === activeMode);
    });
    const data = viewerData[activeMode];
    if (viewerTitle) viewerTitle.textContent = data.title;
    if (viewerDescription) viewerDescription.textContent = data.description;
    if (viewerFeatures) {
      viewerFeatures.innerHTML = data.features.map((feature) => `<li><i data-lucide="circle-check" class="w-4 h-4 text-cyan-300"></i> ${feature}</li>`).join("");
      if (window.lucide) window.lucide.createIcons();
    }
  };

  document.querySelectorAll(".viewer-mode").forEach((button) => {
    button.addEventListener("click", () => setViewerMode(button.dataset.viewerMode));
  });
  setViewerMode("cooling");

  const toggleViewerSpin = document.getElementById("toggleViewerSpin");
  let viewerIsSpinning = true;
  toggleViewerSpin?.addEventListener("click", () => {
    viewerIsSpinning = !viewerIsSpinning;
    rollStage?.classList.toggle("is-paused", !viewerIsSpinning);
    toggleViewerSpin.setAttribute("aria-pressed", String(!viewerIsSpinning));
    toggleViewerSpin.innerHTML = viewerIsSpinning
      ? '<i data-lucide="pause" class="w-3.5 h-3.5"></i> 회전 일시정지'
      : '<i data-lucide="play" class="w-3.5 h-3.5"></i> 회전 재생';
    if (window.lucide) window.lucide.createIcons();
  });

  // 16. Local Customer Order Tracking Portal
  const trackingOrders = {
    "SJ-2026-001": { client: "동진필름 · Ø800 × 5500L 냉각롤", eta: "2026.09.18", percent: 62, active: "coating" },
    "SJ-2026-002": { client: "한빛제지 · 경질 크롬 슈퍼피니싱", eta: "2026.09.23", percent: 82, active: "balance" },
    "SJ-2026-003": { client: "태림나염 · 특허 분사식 나염기", eta: "출하 완료", percent: 100, active: "shipping" },
  };
  const trackingForm = document.getElementById("trackingForm");
  const trackingOrderInput = document.getElementById("trackingOrder");
  const trackingError = document.getElementById("trackingError");
  const trackingSteps = [...document.querySelectorAll(".tracking-step")];
  const trackingStepOrder = ["machining", "coating", "grinding", "balance", "shipping"];

  const renderTrackingOrder = (rawOrderId) => {
    const orderId = String(rawOrderId || "").trim().toUpperCase();
    const order = trackingOrders[orderId];
    if (!order) {
      trackingError?.classList.remove("hidden");
      return false;
    }

    trackingError?.classList.add("hidden");
    const activeIndex = trackingStepOrder.indexOf(order.active);
    const trackingOrderLabel = document.getElementById("trackingOrderLabel");
    const trackingClientLabel = document.getElementById("trackingClientLabel");
    const trackingEta = document.getElementById("trackingEta");
    const trackingPercent = document.getElementById("trackingPercent");
    const trackingProgressBar = document.getElementById("trackingProgressBar");
    if (trackingOrderLabel) trackingOrderLabel.textContent = orderId;
    if (trackingClientLabel) trackingClientLabel.textContent = order.client;
    if (trackingEta) trackingEta.textContent = order.eta;
    if (trackingPercent) trackingPercent.textContent = `${order.percent}%`;
    if (trackingProgressBar) trackingProgressBar.style.width = `${order.percent}%`;

    trackingSteps.forEach((step, index) => {
      const isComplete = order.percent >= 100 || index < activeIndex;
      const isActive = order.percent < 100 && index === activeIndex;
      step.classList.toggle("done", isComplete);
      step.classList.toggle("active", isActive);
      const status = step.querySelector("small");
      if (status) status.textContent = isComplete ? "완료" : isActive ? "진행 중" : "대기";
    });
    return true;
  };

  trackingForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    renderTrackingOrder(trackingOrderInput?.value);
  });
  document.querySelectorAll("[data-demo-order]").forEach((button) => {
    button.addEventListener("click", () => {
      if (trackingOrderInput) trackingOrderInput.value = button.dataset.demoOrder;
      renderTrackingOrder(button.dataset.demoOrder);
    });
  });
  renderTrackingOrder(trackingOrderInput?.value || "SJ-2026-001");

  // 17. Technical Case Library Filters
  const caseFilterButtons = [...document.querySelectorAll(".case-filter")];
  const caseLibraryCards = [...document.querySelectorAll(".case-library-card")];
  caseFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.caseFilter || "all";
      caseFilterButtons.forEach((filterButton) => filterButton.classList.toggle("active", filterButton === button));
      caseLibraryCards.forEach((card) => {
        const tags = (card.dataset.caseTags || "").split(" ");
        card.classList.toggle("is-filtered-out", filter !== "all" && !tags.includes(filter));
      });
    });
  });

  // Keep the experimental jumpbar in sync with the section currently in view.
  const jumpbarLinks = [...document.querySelectorAll(".experiment-jumpbar a")];
  if (jumpbarLinks.length && "IntersectionObserver" in window) {
    const jumpbarObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        jumpbarLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });
    jumpbarLinks.forEach((link) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) jumpbarObserver.observe(target);
    });
  }

  console.log("승지정밀산업롤 웹사이트 인터랙션 및 오픈소스 UI 초기화 완료");
});
