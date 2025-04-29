<template>
  <div class="symptom-wrapper">
    <div class="glass-card-outer fade-in-up">
      <!-- Header -->
      <div class="checker-header">
        <h1 class="checker-title">Can You Guess The Disease?</h1>
        <p class="checker-subtitle">
          A Symptom-to-Disease Study Companion for Medical Students
        </p>
      </div>

      <!-- Input -->
      <div class="input-section">
        <input
          v-model="symptoms"
          placeholder="Enter symptoms separated by commas..."
          class="input-glass"
        />
      </div>

      <!-- Error Banner -->
      <transition name="slide">
        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
          <button class="error-dismiss" @click="errorMessage = ''">&times;</button>
        </div>
      </transition>

      <!-- Action -->
      <div class="action-row">
        <button class="btn btn-primary btn-lg" @click.prevent="checkSymptomsAction" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Analyzing...' : 'Check Diagnosis' }}
        </button>
      </div>

      <!-- Results -->
      <transition name="slide">
        <div v-if="resultsVisible" class="result-cards">
          <!-- Left Card: Conditions -->
          <div class="glass-card result-card">
            <h3 class="result-card-title">Most Likely Conditions</h3>
            <div class="result-card-divider"></div>
            <div class="conditions-list">
              <div
                v-for="(item, index) in conditions"
                :key="index"
                class="condition-row"
              >
                <div class="condition-info">
                  <span class="condition-name">{{ item.disease }}</span>
                  <span class="condition-percent">{{ item.confidence.toFixed(1) }}%</span>
                </div>
                <div class="confidence-bar-track">
                  <div
                    class="confidence-bar-fill"
                    :style="{ width: item.confidence.toFixed(1) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Card: Precautions -->
          <div class="glass-card result-card">
            <h3 class="result-card-title">Precautions</h3>
            <div class="result-card-divider"></div>
            <div class="precautions-list">
              <div
                v-for="(item, index) in precautions"
                :key="index"
                class="precaution-row"
              >
                <span class="precaution-bullet"></span>
                <span class="precaution-text">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Clear -->
      <transition name="slide">
        <div v-if="resultsVisible" class="clear-row">
          <button class="btn btn-ghost" @click="clearResults">Clear</button>
        </div>
      </transition>

      <!-- Disclaimer -->
      <p class="disclaimer">For educational purposes only.</p>
    </div>
  </div>
</template>

<script>
import { checkSymptoms } from '@/services/api'

export default {
  name: "SymptomChecker",
  data() {
    return {
      symptoms: "",
      conditions: [],
      precautions: [],
      resultsVisible: false,
      loading: false,
      errorMessage: ""
    };
  },
  methods: {
    async checkSymptomsAction() {
      if (!this.symptoms.trim()) return;
      this.loading = true;
      this.errorMessage = "";

      try {
        const { data } = await checkSymptoms(
          this.symptoms.split(",").map((s) => s.trim())
        );

        this.conditions = data.predictions || [];
        this.precautions = data.precautions || [];

        if (this.conditions.length > 0) {
          this.resultsVisible = true;
          this.scrollToResults();
        } else {
          this.errorMessage = "No matching conditions found. Try different symptoms.";
        }
      } catch (error) {
        this.errorMessage = error.message || "Something went wrong. Please try again later.";
      } finally {
        this.loading = false;
      }
    },

    clearResults() {
      this.symptoms = "";
      this.conditions = [];
      this.precautions = [];
      this.resultsVisible = false;
    },

    scrollToResults() {
      this.$nextTick(() => {
        const el = document.querySelector(".result-cards");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    }
  }
};
</script>

<style scoped>
/* =========================================================
   SYMPTOM CHECKER — Glassmorphic Redesign
   ========================================================= */

/* ---------- Wrapper ---------- */
.symptom-wrapper {
  padding: var(--space-16, 4rem) var(--space-4, 1rem);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
}

/* ---------- Outer Glass Card ---------- */
.glass-card-outer {
  background: var(--glass-white, rgba(255, 255, 255, 0.35));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.45));
  box-shadow: var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.08));
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-radius: var(--radius-2xl, 1.5rem);
  padding: var(--space-12, 3rem) var(--space-8, 2rem);
  max-width: 1080px;
  width: 100%;
  text-align: center;
  transition: box-shadow 0.3s ease;
}

.glass-card-outer:hover {
  box-shadow: var(--glass-shadow-hover, 0 12px 48px rgba(0, 0, 0, 0.12));
}

/* ---------- Header ---------- */
.checker-header {
  margin-bottom: var(--space-8, 2rem);
}

.checker-title {
  font-family: var(--font-heading, "Georgia", serif);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary, #2c3e2d);
  margin: 0 0 var(--space-2, 0.5rem);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.checker-subtitle {
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 1.1rem;
  color: var(--secondary, #c8a96e);
  margin: 0;
  font-weight: 500;
}

/* ---------- Input ---------- */
.input-section {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-6, 1.5rem);
}

.input-glass {
  width: 100%;
  max-width: 720px;
  padding: var(--space-4, 1rem) var(--space-5, 1.25rem);
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 1rem;
  color: var(--text-primary, #2c3e2d);
  background: var(--glass-white-md, rgba(255, 255, 255, 0.55));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.45));
  border-radius: var(--radius-2xl, 1.5rem);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  outline: none;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.input-glass::placeholder {
  color: var(--text-tertiary, #8a9a8b);
}

.input-glass:focus {
  border-color: var(--primary, #3d9970);
  box-shadow: 0 0 0 3px rgba(61, 153, 112, 0.18);
}

/* ---------- Action Row ---------- */
.action-row {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-4, 1rem);
}

/* ---------- Buttons ---------- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body, "Inter", sans-serif);
  font-weight: 600;
  border: none;
  border-radius: var(--radius-2xl, 1.5rem);
  cursor: pointer;
  transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease;
}

.btn:active {
  transform: scale(0.97);
}

.btn-lg {
  padding: var(--space-3, 0.75rem) var(--space-8, 2rem);
  font-size: 1.05rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary, #3d9970), #2e7d5e);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(61, 153, 112, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2e7d5e, #24654b);
  box-shadow: 0 6px 20px rgba(61, 153, 112, 0.4);
}

.btn-ghost {
  background: transparent;
  color: var(--danger, #c0503a);
  border: 1px solid var(--danger, #c0503a);
  padding: var(--space-2, 0.5rem) var(--space-6, 1.5rem);
  font-size: 0.95rem;
  font-weight: 600;
}

.btn-ghost:hover {
  background: rgba(192, 80, 58, 0.08);
}

/* ---------- Result Cards Grid ---------- */
.result-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6, 1.5rem);
  margin-top: var(--space-10, 2.5rem);
  text-align: left;
}

/* ---------- Glass Card (inner results) ---------- */
.glass-card {
  background: var(--glass-white, rgba(255, 255, 255, 0.35));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.45));
  box-shadow: var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.08));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: var(--radius-2xl, 1.5rem);
  transition: box-shadow 0.3s ease;
}

.glass-card:hover {
  box-shadow: var(--glass-shadow-hover, 0 12px 48px rgba(0, 0, 0, 0.12));
}

.result-card {
  padding: var(--space-6, 1.5rem) var(--space-6, 1.5rem) var(--space-8, 2rem);
}

.result-card-title {
  font-family: var(--font-heading, "Georgia", serif);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary, #2c3e2d);
  text-align: center;
  margin: 0 0 var(--space-3, 0.75rem);
}

.result-card-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--glass-border, rgba(255, 255, 255, 0.45)),
    var(--secondary, #c8a96e),
    var(--glass-border, rgba(255, 255, 255, 0.45)),
    transparent
  );
  margin-bottom: var(--space-5, 1.25rem);
}

/* ---------- Conditions List ---------- */
.conditions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 1rem);
}

.condition-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 0.25rem);
}

.condition-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.condition-name {
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary, #2c3e2d);
}

.condition-percent {
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary, #3d9970);
}

.confidence-bar-track {
  width: 100%;
  height: 8px;
  background: rgba(61, 153, 112, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.confidence-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--primary, #3d9970), #2e7d5e);
  transition: width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-width: 4px;
}

/* ---------- Precautions List ---------- */
.precautions-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 0.75rem);
}

.precaution-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3, 0.75rem);
}

.precaution-bullet {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary, #3d9970);
  margin-top: 5px;
}

.precaution-text {
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 0.95rem;
  color: var(--text-secondary, #4a5e4b);
  line-height: 1.55;
}

/* ---------- Clear Row ---------- */
.clear-row {
  display: flex;
  justify-content: center;
  margin-top: var(--space-8, 2rem);
}

/* ---------- Error Banner ---------- */
.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 720px;
  margin: 0 auto var(--space-4, 1rem);
  padding: var(--space-3, 0.75rem) var(--space-5, 1.25rem);
  background: rgba(192, 80, 58, 0.1);
  border: 1px solid rgba(192, 80, 58, 0.25);
  border-radius: var(--radius-2xl, 1.5rem);
  color: var(--danger, #c0503a);
  font-size: 0.9rem;
}

.error-dismiss {
  background: none;
  border: none;
  color: var(--danger, #c0503a);
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0 0 0 var(--space-3, 0.75rem);
  line-height: 1;
}

/* ---------- Spinner ---------- */
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ---------- Disclaimer ---------- */
.disclaimer {
  font-family: var(--font-body, "Inter", sans-serif);
  font-size: 0.8rem;
  color: var(--text-tertiary, #8a9a8b);
  margin-top: var(--space-8, 2rem);
  margin-bottom: 0;
  letter-spacing: 0.02em;
}

/* ---------- Slide Transition ---------- */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.45s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ---------- Fade-in-up Animation ---------- */
.fade-in-up {
  animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---------- Responsive ---------- */
@media (max-width: 768px) {
  .glass-card-outer {
    padding: var(--space-8, 2rem) var(--space-4, 1rem);
  }

  .checker-title {
    font-size: 1.75rem;
  }

  .checker-subtitle {
    font-size: 0.95rem;
  }

  .result-cards {
    grid-template-columns: 1fr;
  }

  .input-glass {
    max-width: 100%;
  }
}
</style>
