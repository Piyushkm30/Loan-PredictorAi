/**
 * LoanPredict AI — main.js
 * Global JS: dark/light toggle, nav, counters, reveal, toast, history, analytics
 */

// ── State & Variables ──────────────────────────────────────────
const THEME_KEY = "lp_theme";
let cachedAnalyticsData = null;

// ── Theme management ───────────────────────────────────────────
function updateChartsTheme(isDark) {
  if (!cachedAnalyticsData || !document.getElementById("chartDonut") || typeof Plotly === "undefined") return;

  const fontColor = isDark ? "#e2e8f0" : "#0f172a";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const layout_patch = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { color: fontColor, family: "Inter, sans-serif" }
  };

  const cfg = { responsive: true, displayModeBar: false };

  try {
    if (cachedAnalyticsData.charts && cachedAnalyticsData.charts.donut) {
      const donutLayout = { ...cachedAnalyticsData.charts.donut.layout, ...layout_patch };
      Plotly.react("chartDonut", cachedAnalyticsData.charts.donut.data, donutLayout, cfg);
    }

    if (cachedAnalyticsData.charts && cachedAnalyticsData.charts.income) {
      const incomeLayout = {
        ...cachedAnalyticsData.charts.income.layout,
        ...layout_patch,
        xaxis: { ...cachedAnalyticsData.charts.income.layout.xaxis, gridcolor: gridColor, color: fontColor },
        yaxis: { ...cachedAnalyticsData.charts.income.layout.yaxis, gridcolor: gridColor, color: fontColor }
      };
      Plotly.react("chartIncome", cachedAnalyticsData.charts.income.data, incomeLayout, cfg);
    }

    if (cachedAnalyticsData.charts && cachedAnalyticsData.charts.credit) {
      const creditLayout = {
        ...cachedAnalyticsData.charts.credit.layout,
        ...layout_patch,
        xaxis: { ...cachedAnalyticsData.charts.credit.layout.xaxis, gridcolor: gridColor, color: fontColor },
        yaxis: { ...cachedAnalyticsData.charts.credit.layout.yaxis, gridcolor: gridColor, color: fontColor }
      };
      Plotly.react("chartCredit", cachedAnalyticsData.charts.credit.data, creditLayout, cfg);
    }

    if (cachedAnalyticsData.charts && cachedAnalyticsData.charts.area) {
      const areaLayout = {
        ...cachedAnalyticsData.charts.area.layout,
        ...layout_patch,
        xaxis: { ...cachedAnalyticsData.charts.area.layout.xaxis, gridcolor: gridColor, color: fontColor },
        yaxis: { ...cachedAnalyticsData.charts.area.layout.yaxis, gridcolor: gridColor, color: fontColor }
      };
      Plotly.react("chartArea", cachedAnalyticsData.charts.area.data, areaLayout, cfg);
    }
  } catch (err) {
    console.error("Plotly theme update error:", err);
  }
}
window.updateChartsTheme = updateChartsTheme;

function applyTheme(isDark) {
  const themeBtn = document.getElementById("themeToggle");
  if (isDark) {
    document.body.classList.remove("light-mode");
    if (themeBtn) themeBtn.textContent = "☀️";
    localStorage.setItem(THEME_KEY, "dark");
  } else {
    document.body.classList.add("light-mode");
    if (themeBtn) themeBtn.textContent = "🌙";
    localStorage.setItem(THEME_KEY, "light");
  }

  updateChartsTheme(isDark);

  // Update slider fill track percentages
  document.querySelectorAll("input[type='range']").forEach(range => {
    const min = parseFloat(range.min) || 0;
    const max = parseFloat(range.max) || 100;
    const val = parseFloat(range.value) || 0;
    const pct = ((val - min) / (max - min)) * 100;
    range.style.setProperty("--pct", pct + "%");
  });
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const isDark = saved !== "light"; // default to dark
  applyTheme(isDark);

  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentlyLight = document.body.classList.contains("light-mode");
      applyTheme(currentlyLight); // if currently light, switch to dark (true); if currently dark, switch to light (false)
    });
  }
}

// ── Mobile Nav ─────────────────────────────────────────────────
function initMobileNav() {
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobileNav");

  if (hamburger && mobileNav) {
    hamburger.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
    });
    document.addEventListener("click", e => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove("open");
      }
    });
  }
}

// ── Animated counters ──────────────────────────────────────────
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  if (isNaN(target)) return;
  const suffix = el.dataset.suffix || "";
  const prefix = el.dataset.prefix || "";
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
  const duration = 1500;
  const step = 20;
  let current = 0;
  const increment = target / (duration / step);
  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = prefix + current.toFixed(decimals) + suffix;
    if (current >= target) clearInterval(timer);
  }, step);
}

function initCounters() {
  const elements = document.querySelectorAll("[data-target]");
  if (!elements.length) return;

  if ("IntersectionObserver" in window) {
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    elements.forEach(el => counterObs.observe(el));
  } else {
    elements.forEach(el => animateCounter(el));
  }
}

// ── Scroll Reveal ──────────────────────────────────────────────
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  if ("IntersectionObserver" in window) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => revealObs.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("visible"));
  }
}

// ── Toast notifications ────────────────────────────────────────
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container") || (() => {
    const d = document.createElement("div");
    d.id = "toast-container";
    document.body.appendChild(d);
    return d;
  })();
  const icons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateX(30px)"; }, 3500);
  setTimeout(() => toast.remove(), 3800);
}
window.showToast = showToast;

// ── Global Bulletproof Slider & Preset System ──────────────────
function updateSlider(range) {
  if (typeof range === "string") range = document.getElementById(range);
  if (!range) return;
  const min = parseFloat(range.min) || 0;
  const max = parseFloat(range.max) || 100;
  const val = parseFloat(range.value) || 0;
  const pct = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));

  // Directly set CSS property and inline gradient background for 100% cross-browser accuracy
  range.style.setProperty("--pct", pct + "%");
  range.style.background = `linear-gradient(to right, #4f8ef7 0%, #4f8ef7 ${pct}%, rgba(255,255,255,0.12) ${pct}%)`;

  const valEl = document.getElementById(range.id + "_val");
  if (valEl) {
    const prefix = range.dataset.prefix || "";
    const suffix = range.dataset.suffix || "";
    valEl.textContent = prefix + Number(val).toLocaleString('en-IN') + suffix;
  }

  // Update active preset button highlight
  const parent = range.closest(".form-group");
  if (parent) {
    parent.querySelectorAll(".preset-btn").forEach(btn => {
      const pVal = btn.getAttribute("data-val");
      if (pVal !== null && parseFloat(pVal) === val) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
}
window.updateSlider = updateSlider;

function setSliderPreset(fieldId, value) {
  const range = document.getElementById(fieldId);
  if (!range) return;
  range.value = value;
  updateSlider(range);
}
window.setSliderPreset = setSliderPreset;
window.setFieldValue = setSliderPreset; // Alias for backward compatibility

// ── Prediction Form & Sliders ──────────────────────────────────
function initPredictForm() {
  const predictForm = document.getElementById("predictForm");
  if (!predictForm) return;

  // Initialize and attach range sliders
  predictForm.querySelectorAll("input[type='range']").forEach(range => {
    range.addEventListener("input", () => updateSlider(range));
    range.addEventListener("change", () => updateSlider(range));
    updateSlider(range);
  });

  // Submit
  predictForm.addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(predictForm));
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("active");

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (overlay) overlay.classList.remove("active");
      if (json.success) {
        renderResult(json.result);
        const resSec = document.getElementById("resultSection");
        if (resSec) resSec.scrollIntoView({ behavior: "smooth" });
      } else {
        showToast("Prediction failed: " + (json.error || "Unknown error"), "error");
      }
    } catch (err) {
      if (overlay) overlay.classList.remove("active");
      showToast("Network error. Please try again.", "error");
    }
  });

  // Reset
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      predictForm.reset();
      predictForm.querySelectorAll("input[type='range']").forEach(r => r.dispatchEvent(new Event("input")));
      const rs = document.getElementById("resultSection");
      if (rs) rs.style.display = "none";
      showToast("Form reset.", "info");
    });
  }
}

// ── Render prediction result ───────────────────────────────────
function renderResult(r) {
  const section = document.getElementById("resultSection");
  if (!section) return;

  const sb = r.selected_bank || {};
  const altBanks = r.alternative_banks || [];
  const riskClass = { Low: "risk-low", Medium: "risk-medium", High: "risk-high" }[r.risk_level] || "";
  const gradColor = r.approved
    ? "linear-gradient(90deg, #34d399, #22d3ee)"
    : "linear-gradient(90deg, #f87171, #a855f7)";

  // HTML for Selected Bank Section
  let selectedBankHtml = "";
  if (sb && sb.name) {
    if (sb.eligible) {
      selectedBankHtml = `
        <div class="selected-bank-card approved mb-4 reveal visible">
          <div class="bank-card-header">
            <div class="d-flex align-center gap-2">
              <span class="bank-avatar-lg">${sb.icon || "🏛️"}</span>
              <div>
                <div class="bank-badge-title">Selected Bank Decision</div>
                <h3 class="bank-name-lg">${sb.name}</h3>
              </div>
            </div>
            <div class="bank-decision-badge approved">
              ✅ Approved by ${sb.short_name || "Bank"}
            </div>
          </div>

          <div class="bank-status-note">
            ${sb.status_message || "Congratulations! You meet all underwriting standards for this bank."}
          </div>

          <div class="bank-kpi-grid">
            <div class="bank-kpi-box">
              <span class="kpi-label">Interest Rate</span>
              <span class="kpi-val highlight-cyan">${sb.interest_rate}</span>
            </div>
            <div class="bank-kpi-box">
              <span class="kpi-label">Estimated Monthly EMI</span>
              <span class="kpi-val highlight-green">${sb.monthly_emi_formatted} / mo</span>
            </div>
            <div class="bank-kpi-box">
              <span class="kpi-label">Max Approved Limit</span>
              <span class="kpi-val">${sb.max_amount_formatted}</span>
            </div>
            <div class="bank-kpi-box">
              <span class="kpi-label">Processing Fee</span>
              <span class="kpi-val">${sb.processing_fee}</span>
            </div>
          </div>

          ${sb.perks && sb.perks.length ? `
            <div class="bank-perks-list">
              <div class="perks-title">🌟 Key Bank Benefits:</div>
              <div class="perks-chips">
                ${sb.perks.map(p => `<span class="perk-chip">✓ ${p}</span>`).join("")}
              </div>
            </div>
          ` : ""}

          <div class="d-flex justify-between align-center mt-3 pt-2" style="border-top:1px solid var(--border)">
            <span class="text-muted" style="font-size:0.85rem">⏱️ Estimated Disbursal: <strong>${sb.turnaround || "2-3 Days"}</strong></span>
            <button class="btn-primary" onclick="openApplyModal('${escapeHtml(sb.name)}', '${sb.interest_rate}', '${sb.monthly_emi_formatted}', '${sb.max_amount_formatted}')">
              🚀 Apply with ${sb.short_name || "Bank"}
            </button>
          </div>
        </div>
      `;
    } else {
      selectedBankHtml = `
        <div class="selected-bank-card rejected mb-4 reveal visible">
          <div class="bank-card-header">
            <div class="d-flex align-center gap-2">
              <span class="bank-avatar-lg">${sb.icon || "🏛️"}</span>
              <div>
                <div class="bank-badge-title">Selected Bank Decision</div>
                <h3 class="bank-name-lg">${sb.name}</h3>
              </div>
            </div>
            <div class="bank-decision-badge rejected">
              ⚠️ Not Eligible for ${sb.short_name || "Selected Bank"}
            </div>
          </div>

          <div class="bank-status-note rejected-text">
            ${sb.status_message || "You do not meet the minimum underwriting standards for this bank at this time."}
          </div>

          ${sb.rejection_reasons && sb.rejection_reasons.length ? `
            <div class="rejection-reasons-box">
              <strong>🔍 Why ${sb.short_name || "this bank"} was not approved:</strong>
              <ul>
                ${sb.rejection_reasons.map(r => `<li>${r}</li>`).join("")}
              </ul>
            </div>
          ` : ""}

          <div class="alternative-banner-callout">
            <span class="callout-icon">💡</span>
            <div>
              <strong>Don't worry!</strong> While ${sb.name} has specific restrictions, 
              our AI has found <strong>${altBanks.filter(b => b.eligible).length || 5}+ top partner banks</strong> where your loan 
              <strong style="color:var(--green)">CAN be approved</strong>! See your matched options below:
            </div>
          </div>
        </div>
      `;
    }
  }

  // HTML for 5-6 Alternative/Recommended Bank Cards
  let altBanksHtml = "";
  if (altBanks && altBanks.length > 0) {
    const isAltApproved = altBanks.some(b => b.eligible);
    altBanksHtml = `
      <div class="multi-banks-section mt-4 reveal visible">
        <div class="d-flex align-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <div class="section-label">MULTI-BANK INTELLIGENCE</div>
            <h3 style="font-size:1.25rem">
              ${sb.eligible 
                ? `✨ 5–6 Top Partner Banks Also Approving Your Loan` 
                : `🎉 You CAN Get Approved at These 5–6 Alternative Banks:`}
            </h3>
            <p class="text-muted" style="font-size:0.9rem">
              ${sb.eligible 
                ? `Compare competitive interest rates, EMIs, and turnaround times from our trusted banking partners.` 
                : `These verified lenders and institutions match your current income, credit, and employment profile.`}
            </p>
          </div>
          <div class="badge ${isAltApproved ? 'badge-green' : 'badge-yellow'}" style="font-size:0.9rem;padding:0.4rem 0.9rem">
            ${r.total_eligible_banks || altBanks.filter(b => b.eligible).length} / ${r.total_evaluated || 10} Banks Eligible
          </div>
        </div>

        <div class="bank-grid">
          ${altBanks.map(b => `
            <div class="bank-card glass-card ${b.eligible ? 'bank-eligible' : 'bank-conditional'}">
              <div class="bank-card-top">
                <div class="d-flex align-center gap-2">
                  <span class="bank-avatar">${b.icon || "🏛️"}</span>
                  <div>
                    <div class="bank-title">${b.name}</div>
                    <span class="bank-sub-type">${b.type}</span>
                  </div>
                </div>
                <div class="bank-tag-pill ${b.eligible ? 'pill-green' : 'pill-amber'}">
                  ${b.tag || (b.eligible ? 'Approved' : 'Pre-Qualified')}
                </div>
              </div>

              <div class="bank-match-bar-wrap">
                <div class="d-flex justify-between" style="font-size:0.75rem;margin-bottom:3px">
                  <span class="text-muted">Approval Match Score</span>
                  <span style="font-weight:700;color:${b.eligible ? 'var(--green)' : 'var(--amber)'}">${b.match_score}%</span>
                </div>
                <div class="match-bar-track">
                  <div class="match-bar-fill" style="width:${b.match_score}%;background:${b.eligible ? 'var(--grad-success)' : 'var(--grad-danger)'}"></div>
                </div>
              </div>

              <div class="bank-card-body">
                <div class="bank-metric-row">
                  <div>
                    <span class="bm-label">Interest Rate</span>
                    <span class="bm-val rate-color">${b.interest_rate}</span>
                  </div>
                  <div>
                    <span class="bm-label">Est. EMI</span>
                    <span class="bm-val emi-color">${b.monthly_emi_formatted}</span>
                  </div>
                  <div>
                    <span class="bm-label">Max Limit</span>
                    <span class="bm-val">${b.max_amount_formatted}</span>
                  </div>
                </div>

                <div class="bank-meta-details">
                  <div class="meta-row">
                    <span>⚡ Processing Fee:</span>
                    <strong>${b.processing_fee}</strong>
                  </div>
                  <div class="meta-row">
                    <span>⏱️ Disbursal:</span>
                    <strong>${b.turnaround}</strong>
                  </div>
                </div>

                ${b.perks && b.perks.length ? `
                  <div class="bank-perk-snippet">
                    💡 ${b.perks[0]}
                  </div>
                ` : ""}
              </div>

              <div class="bank-card-footer">
                <button class="btn-primary btn-sm w-100" onclick="openApplyModal('${escapeHtml(b.name)}', '${b.interest_rate}', '${b.monthly_emi_formatted}', '${b.max_amount_formatted}')">
                  ${b.eligible ? '✓ Apply with Bank' : '📋 View Offer Details'}
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  section.innerHTML = `
    <div class="result-wrapper glass-card" style="overflow:hidden">
      <div class="result-header ${r.approved ? 'approved' : 'rejected'}">
        <div class="result-icon-ring ${r.approved ? 'approved' : 'rejected'}">
          ${r.approved ? '✅' : '❌'}
        </div>
        <div class="result-status ${r.approved ? 'approved' : 'rejected'}">
          ${r.approved ? 'Loan Profile Approved!' : 'Loan Application Review'}
        </div>
        <div class="result-sub">${r.timestamp} &mdash; AI Model Prediction & Multi-Bank Analysis</div>
      </div>

      <div style="padding:1.75rem">
        <!-- Probability bar -->
        <div class="d-flex align-center justify-between mb-1">
          <span style="font-size:.85rem;color:var(--text-secondary)">Overall Model Confidence Probability</span>
          <span class="range-val">${r.probability}%</span>
        </div>
        <div class="prob-bar-wrap mb-3">
          <div class="prob-bar-fill" style="width:0%;background:${gradColor}" id="probBar"></div>
        </div>

        <div class="result-metrics mb-4">
          <div class="metric-item">
            <div class="metric-value" style="background:${gradColor};-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
              ${r.probability}%
            </div>
            <div class="metric-label">Approval Probability</div>
          </div>
          <div class="metric-item">
            <div class="metric-value ${riskClass}">${r.risk_level}</div>
            <div class="metric-label">Risk Assessment</div>
          </div>
          <div class="metric-item">
            <div class="metric-value" style="color:var(--blue)">${r.confidence}%</div>
            <div class="metric-label">AI Confidence</div>
          </div>
        </div>

        <!-- 0. Official Sanction Letter Banner (If Eligible) -->
        ${r.sanction_letter ? `
          <div class="sanction-banner-card mb-4 reveal visible">
            <div class="d-flex align-center justify-between flex-wrap gap-3">
              <div class="d-flex align-center gap-3">
                <div class="sanction-icon-pulse">📜</div>
                <div>
                  <div class="section-label" style="margin-bottom:2px;color:var(--green)">OFFICIAL PRE-APPROVAL ISSUED</div>
                  <h4 style="margin:0;font-size:1.15rem">In-Principle Loan Sanction Letter Generated</h4>
                  <p class="text-muted" style="font-size:0.85rem;margin:0">
                    Sanction Ref: <strong class="gradient-text">${r.sanction_letter.sanction_id}</strong> &bull; Issued for <strong>${r.sanction_letter.bank_name}</strong>
                  </p>
                </div>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <a href="/sanction-letter/${r.sanction_letter.sanction_id}" target="_blank" class="btn-primary" style="padding:0.6rem 1.25rem">
                  📜 Official Letter (Print / PDF)
                </a>
                <button class="btn-secondary" onclick="openSanctionModal('${r.sanction_letter.sanction_id}')" style="padding:0.6rem 1.25rem">
                  🔍 View Sanction Letter
                </button>
              </div>
            </div>
          </div>
        ` : ""}

        <!-- 1. Selected Bank Decision Card -->
        ${selectedBankHtml}

        <!-- 2. 5-6 Multi-Bank Recommendation Grid -->
        ${altBanksHtml}

        <div class="d-flex gap-2 flex-wrap mt-4 pt-3" style="border-top:1px solid var(--border)">
          ${r.sanction_letter ? `
            <a href="/sanction-letter/${r.sanction_letter.sanction_id}" target="_blank" class="btn-primary">
              📜 Print Official Sanction Letter
            </a>
          ` : ""}
          <button class="btn-primary" onclick="downloadReport()">⬇️ Download Multi-Bank PDF Report</button>
          <button class="btn-secondary" onclick="document.getElementById('predictForm').scrollIntoView({behavior:'smooth'})">
            🔄 Modify / New Prediction
          </button>
        </div>
      </div>
    </div>`;

  section.style.display = "block";

  // Animate bar
  requestAnimationFrame(() => {
    setTimeout(() => {
      const bar = document.getElementById("probBar");
      if (bar) bar.style.width = r.probability + "%";
    }, 120);
  });

  // Store for PDF download
  window._lastResult = r;
  loadHistory();
}

// ── Utility: Escape HTML ───────────────────────────────────────
function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// ── Bank Apply Modal ───────────────────────────────────────────
function openApplyModal(bankName, rate, emi, maxAmt) {
  // Remove existing modal if any
  const oldModal = document.getElementById("bankModal");
  if (oldModal) oldModal.remove();

  const modal = document.createElement("div");
  modal.id = "bankModal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content glass-card">
      <div class="modal-header">
        <div class="d-flex align-center gap-2">
          <span style="font-size:1.5rem">🏦</span>
          <h3>Apply with ${bankName}</h3>
        </div>
        <button class="modal-close" onclick="closeApplyModal()">&times;</button>
      </div>
      <div class="modal-body">
        <p class="mb-3 text-secondary">
          Your profile has been pre-screened for <strong>${bankName}</strong>. Review your loan offer terms below:
        </p>

        <div class="modal-offer-summary mb-3">
          <div class="d-flex justify-between py-1"><span>Interest Rate:</span><strong style="color:var(--cyan)">${rate}</strong></div>
          <div class="d-flex justify-between py-1"><span>Monthly EMI:</span><strong style="color:var(--green)">${emi} / mo</strong></div>
          <div class="d-flex justify-between py-1"><span>Max Loan Eligibility:</span><strong>${maxAmt}</strong></div>
          <div class="d-flex justify-between py-1"><span>Documentation:</span><strong style="color:var(--blue)">Digital KYC (Aadhaar/PAN)</strong></div>
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Full Legal Name</label>
          <input type="text" class="form-control" placeholder="Enter your full name" id="applicantFullName" value="Applicant Name">
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Phone Number</label>
          <input type="tel" class="form-control" placeholder="+91 XXXXX XXXXX" id="applicantPhone" value="+91 9876543210">
        </div>

        <div class="form-group mb-3">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-control" placeholder="yourname@domain.com" id="applicantEmail" value="applicant@example.com">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeApplyModal()">Cancel</button>
        <button class="btn-primary" onclick="submitBankApplication('${escapeHtml(bankName)}')">🚀 Submit Application to ${bankName}</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add("open"));
}
window.openApplyModal = openApplyModal;

function closeApplyModal() {
  const modal = document.getElementById("bankModal");
  if (modal) {
    modal.classList.remove("open");
    setTimeout(() => modal.remove(), 250);
  }
}
window.closeApplyModal = closeApplyModal;

function submitBankApplication(bankName) {
  closeApplyModal();
  showToast(`🎉 Loan application for ${bankName} submitted successfully! A representative will contact you within 24 hours.`, "success");
}
window.submitBankApplication = submitBankApplication;

// ── Sanction Letter Modal ──────────────────────────────────────
function openSanctionModal(sanctionId) {
  const r = window._lastResult;
  if (!r || !r.sanction_letter) return;
  const s = r.sanction_letter;

  // Remove existing modal if any
  const oldModal = document.getElementById("sanctionModal");
  if (oldModal) oldModal.remove();

  const modal = document.createElement("div");
  modal.id = "sanctionModal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content glass-card" style="max-width:640px">
      <div class="modal-header">
        <div class="d-flex align-center gap-2">
          <span style="font-size:1.5rem">📜</span>
          <div>
            <h3 style="font-size:1.15rem;margin:0">Pre-Approved Sanction Letter</h3>
            <span class="text-muted" style="font-size:0.75rem">Ref ID: <strong>${s.sanction_id}</strong></span>
          </div>
        </div>
        <button class="modal-close" onclick="closeSanctionModal()">&times;</button>
      </div>

      <div class="modal-body" style="max-height:70vh;overflow-y:auto;padding-right:0.5rem">
        <div class="sanct-modal-banner mb-3">
          <div class="d-flex align-center justify-between">
            <span class="badge badge-green">✓ IN-PRINCIPLE PRE-APPROVED</span>
            <span class="text-muted" style="font-size:0.8rem">Issued: ${s.issue_date}</span>
          </div>
          <p style="font-size:0.9rem;margin-top:0.5rem;color:var(--text-secondary)">
            Issued to <strong>${s.applicant_name}</strong> for <strong>${s.bank_name}</strong>.
          </p>
        </div>

        <div class="sanct-terms-grid mb-3">
          <div class="sanct-term-item">
            <span class="label">Approved Loan Amount</span>
            <span class="val highlight-green" style="font-size:1.15rem">${s.loan_amount}</span>
          </div>
          <div class="sanct-term-item">
            <span class="label">Interest Rate</span>
            <span class="val highlight-cyan">${s.interest_rate} p.a.</span>
          </div>
          <div class="sanct-term-item">
            <span class="label">Monthly EMI</span>
            <span class="val">${s.monthly_emi} / mo</span>
          </div>
          <div class="sanct-term-item">
            <span class="label">Approved Tenure</span>
            <span class="val">${s.loan_term}</span>
          </div>
          <div class="sanct-term-item">
            <span class="label">Processing Fee</span>
            <span class="val">${s.processing_fee}</span>
          </div>
          <div class="sanct-term-item">
            <span class="label">Foreclosure Penalty</span>
            <span class="val">${s.prepayment_charges}</span>
          </div>
        </div>

        <div class="reasons-box-modal mb-3">
          <strong style="color:var(--cyan);font-size:0.85rem;display:block;margin-bottom:0.35rem">
            🎯 Why Your Loan Was Pre-Approved:
          </strong>
          <ul style="font-size:0.82rem;padding-left:1.2rem;color:var(--text-secondary);line-height:1.5">
            ${s.reasons.map(r => `<li>${r}</li>`).join("")}
          </ul>
        </div>

        <div class="d-flex align-center justify-between p-3" style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:10px">
          <div class="d-flex align-center gap-3">
            <div style="font-size:2rem;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:rgba(34,211,238,0.1);border-radius:50%;flex-shrink:0">🛡️</div>
            <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.4">
              <strong style="color:var(--text-primary)">Official System Sanction Certificate</strong><br>
              Auth ID: <strong class="gradient-text">${s.sanction_id}</strong> &bull; Underwriter: <strong>Rajkamal</strong>
            </div>
          </div>
          <div style="text-align:right">
            <img src="/static/images/rajkamal_signature.png" alt="Rajkamal Signature" style="height:44px;width:auto;filter:brightness(1.5)">
            <div style="font-size:0.72rem;color:var(--text-muted);font-weight:600">Rajkamal (Authorized)</div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeSanctionModal()">Close</button>
        <a href="/sanction-letter/${s.sanction_id}" target="_blank" class="btn-primary">
          🖨️ Full Letter &amp; Print PDF
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add("open"));
}
window.openSanctionModal = openSanctionModal;

function closeSanctionModal() {
  const modal = document.getElementById("sanctionModal");
  if (modal) {
    modal.classList.remove("open");
    setTimeout(() => modal.remove(), 250);
  }
}
window.closeSanctionModal = closeSanctionModal;

// ── Download report (PDF via browser print) ────────────────────
function downloadReport() {
  const r = window._lastResult;
  if (!r) return;
  const sb = r.selected_bank || {};
  const altBanks = r.alternative_banks || [];

  const win = window.open("", "_blank");
  win.document.write(`
    <html><head><title>LoanPredict AI — Multi-Bank Prediction Report</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
    <style>
      body{font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;padding:36px;color:#1e293b;max-width:820px;margin:0 auto;line-height:1.5}
      h1{color:#1e40af;margin-bottom:4px;font-size:1.8rem}
      .badge{display:inline-block;padding:4px 14px;border-radius:999px;font-weight:700;font-size:1rem}
      .approved{background:#dcfce7;color:#16a34a}
      .rejected{background:#fee2e2;color:#dc2626}
      table{width:100%;border-collapse:collapse;margin:16px 0}
      td,th{padding:9px 12px;border:1px solid #cbd5e1;font-size:.88rem;text-align:left}
      th{background:#f1f5f9;font-weight:600;color:#0f172a}
      .bank-box{border:1px solid #94a3b8;border-radius:8px;padding:16px;margin:16px 0;background:#f8fafc}
      .signature-style{font-family:'Great Vibes', 'Dancing Script', cursive;font-size:2.4rem;color:#1e3a8a;line-height:1;margin-bottom:2px}
      .footer{color:#64748b;font-size:.78rem;margin-top:30px;border-top:1px solid #e2e8f0;padding-top:10px}
    </style></head><body>
    <h1>🏦 LoanPredict AI &mdash; Official Multi-Bank Eligibility Report</h1>
    <p style="color:#64748b;font-size:.9rem">Generated on: <strong>${r.timestamp}</strong></p>
    
    <h2>Overall AI Assessment: <span class="badge ${r.approved?'approved':'rejected'}">${r.approved?'✅ APPROVED':'❌ PROFILE REVIEW REQUIRED'}</span></h2>
    <table>
      <tr><th>AI Probability Score</th><td>${r.probability}%</td><th>Risk Category</th><td>${r.risk_level}</td></tr>
      <tr><th>Model Confidence</th><td>${r.confidence}%</td><th>Eligible Banks</th><td>${r.total_eligible_banks || 'N/A'} of ${r.total_evaluated || 10}</td></tr>
    </table>

    <div class="bank-box">
      <h3>Selected Bank: ${sb.name || 'Not Specified'}</h3>
      <p><strong>Status:</strong> <span class="badge ${sb.eligible?'approved':'rejected'}">${sb.eligible?'✅ ELIGIBLE & APPROVED':'⚠️ CRITERIA NOT MET'}</span></p>
      ${sb.eligible ? `
        <p><strong>Interest Rate:</strong> ${sb.interest_rate} | <strong>Estimated EMI:</strong> ${sb.monthly_emi_formatted}/mo | <strong>Max Amount:</strong> ${sb.max_amount_formatted}</p>
        <p><strong>Processing Fee:</strong> ${sb.processing_fee} | <strong>Turnaround:</strong> ${sb.turnaround || '2-3 Days'}</p>
      ` : `
        <p style="color:#b91c1c"><strong>Reason:</strong> ${sb.rejection_reasons && sb.rejection_reasons.length ? sb.rejection_reasons.join('; ') : sb.status_message}</p>
      `}
    </div>

    <h3>Top 5–6 Recommended Partner Banks</h3>
    <table>
      <thead>
        <tr>
          <th>Bank Name</th>
          <th>Status</th>
          <th>Interest Rate</th>
          <th>Est. Monthly EMI</th>
          <th>Max Loan Limit</th>
          <th>Processing Fee</th>
        </tr>
      </thead>
      <tbody>
        ${altBanks.map(b => `
          <tr>
            <td><strong>${b.name}</strong> (${b.type})</td>
            <td><span class="badge ${b.eligible?'approved':'rejected'}" style="font-size:0.75rem">${b.eligible?'Approved':'Pre-Qualified'}</span></td>
            <td><strong>${b.interest_rate}</strong></td>
            <td>${b.monthly_emi_formatted}</td>
            <td>${b.max_amount_formatted}</td>
            <td>${b.processing_fee}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="bank-box" style="background:#eff6ff;border-color:#bfdbfe">
      <strong>💡 Financial Advice:</strong>
      <p>${r.recommendation}</p>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:24px;border-top:1px solid #cbd5e1;padding-top:14px">
      <div style="font-size:0.8rem;color:#64748b">
        <strong>Digital Record Ref:</strong> ${r.sanction_letter ? r.sanction_letter.sanction_id : 'LP-VERIFIED-2026'}<br>
        Verified by AI Credit Risk Evaluation Bureau
      </div>
      <div style="text-align:right">
        <img src="/static/images/rajkamal_signature.png" alt="Signature" style="height:52px;width:auto;display:block;margin-left:auto">
        <div style="font-weight:700;font-size:0.85rem;color:#0f172a;margin-top:2px">Rajkamal</div>
        <div style="font-size:0.75rem;color:#64748b">Chief Underwriting Officer</div>
        <div style="display:inline-block;border:1px dashed #2563eb;color:#2563eb;padding:3px 8px;border-radius:4px;font-size:0.7rem;font-weight:700;margin-top:4px">OFFICIALLY VERIFIED</div>
      </div>
    </div>

    <div class="footer">
      <p>LoanPredict AI &mdash; Advanced Machine Learning Credit Analytics. Terms and interest rates subject to final bank verification.</p>
    </div>
    </body></html>`);
  win.document.close();
  win.print();
}
window.downloadReport = downloadReport;

// ── Prediction history table ───────────────────────────────────
async function loadHistory() {
  const tbody = document.getElementById("historyBody");
  if (!tbody) return;

  try {
    const res = await fetch("/api/history");
    const json = await res.json();

    if (!json.success || !json.history) return;

    if (json.history.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center;color:var(--text-muted);padding:1.5rem">
            No predictions recorded in this session yet.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = json.history.map(h => `
      <tr>
        <td>#${h.id}</td>
        <td>${h.timestamp}</td>
        <td>₹${Number(h.applicant_income).toLocaleString('en-IN')}</td>
        <td>₹${Number(h.loan_amount).toLocaleString('en-IN')}</td>
        <td>
          <span style="font-weight:600">
            ${h.bank_name ? h.bank_name.split('(')[0].trim() : 'Any Bank'}
          </span>
          ${h.bank_eligible !== undefined ? (h.bank_eligible ? ' <span style="color:var(--green);font-size:0.8rem">✓</span>' : ' <span style="color:var(--red);font-size:0.8rem">✗</span>') : ''}
        </td>
        <td>${h.credit_history}</td>
        <td>
          <span class="badge ${h.approved ? 'badge-green' : 'badge-red'}">
            ${h.approved ? 'Approved' : 'Rejected'}
          </span>
        </td>
        <td>${h.probability}%</td>
        <td>
          <span class="badge ${
            h.risk_level === 'Low'
              ? 'badge-green'
              : h.risk_level === 'Medium'
              ? 'badge-yellow'
              : 'badge-red'
          }">
            ${h.risk_level}
          </span>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("History Error:", err);
  }
}
window.loadHistory = loadHistory;

// ── Analytics dashboard ────────────────────────────────────────
async function loadAnalytics() {
  if (!document.getElementById("chartDonut")) return;
  try {
    const res = await fetch("/api/analytics");
    const json = await res.json();
    if (!json.success) return;

    cachedAnalyticsData = json;
    const isDark = !document.body.classList.contains("light-mode");
    updateChartsTheme(isDark);

    // KPIs
    const k = json.kpis;
    if (k) {
      const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) {
          el.dataset.target = val;
          animateCounter(el);
        }
      };
      set("kpiTotal",    k.total);
      set("kpiApproved", k.approved);
      set("kpiRate",     k.approval_rate);
      set("kpiIncome",   k.avg_income);
      set("kpiLoan",     k.avg_loan);
    }
  } catch(e) {
    console.error("Analytics load error:", e);
  }
}

// ── Initialize everything when DOM is ready ────────────────────
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initMobileNav();
    initScrollReveal();
    initCounters();
    initPredictForm();
    loadHistory();
    loadAnalytics();
  });
} else {
  initTheme();
  initMobileNav();
  initScrollReveal();
  initCounters();
  initPredictForm();
  loadHistory();
  loadAnalytics();
}
