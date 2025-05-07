<template>
  <div class="simulation-view">
    <CaseSelector v-if="!caseData" @start="loadCase" />

    <!-- Mode Selector -->
    <div v-else-if="!modeChosen" class="mode-selector glass-card">
      <h2 class="mode-selector__title">Choose Simulation Mode</h2>
      <p class="mode-selector__subtitle">{{ caseData.title }}</p>
      <div class="mode-selector__buttons">
        <button
          class="mode-selector__btn glass"
          :class="{ 'mode-selector__btn--active': hoveredMode === 'standard' }"
          @mouseenter="hoveredMode = 'standard'"
          @mouseleave="hoveredMode = ''"
          @click="chooseMode('standard')"
        >
          <span class="mode-selector__btn-label">Standard</span>
          <span class="mode-selector__btn-desc">
            Linear step-by-step with AI feedback at the end
          </span>
        </button>
        <button
          class="mode-selector__btn glass"
          :class="{ 'mode-selector__btn--active': hoveredMode === 'advanced' }"
          @mouseenter="hoveredMode = 'advanced'"
          @mouseleave="hoveredMode = ''"
          @click="chooseMode('advanced')"
        >
          <span class="mode-selector__btn-label">Advanced</span>
          <span class="mode-selector__btn-desc">
            Countdown timer, live scoring, vitals drift, diagnostics, and rich summary
          </span>
        </button>
      </div>
      <button class="btn btn-ghost mode-selector__back" @click="reset">
        Back to Cases
      </button>
    </div>

    <!-- Standard Runner -->
    <SimulationRunner
      v-else-if="selectedMode === 'standard'"
      :caseData="caseData"
      @back="reset"
    />

    <!-- Advanced Runner -->
    <AdvancedSimulationRunner
      v-else-if="selectedMode === 'advanced'"
      :caseData="caseData"
      @back="reset"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CaseSelector from '@/components/CaseSelector.vue'
import SimulationRunner from '@/components/SimulationRunner.vue'
import AdvancedSimulationRunner from '@/components/AdvancedSimulationRunner.vue'
import { loadCase as fetchCase } from '@/services/api'

const caseData = ref(null)
const selectedMode = ref('')
const modeChosen = ref(false)
const hoveredMode = ref('')

async function loadCase(filename) {
  try {
    const { data } = await fetchCase(filename)
    caseData.value = data
  } catch (error) {
    console.error('Failed to load case:', error)
  }
}

function chooseMode(mode) {
  selectedMode.value = mode
  modeChosen.value = true
}

function reset() {
  caseData.value = null
  selectedMode.value = ''
  modeChosen.value = false
}
</script>

<style scoped>
.simulation-view {
  width: 100%;
}

/* Mode Selector */
.mode-selector {
  max-width: 600px;
  margin: var(--space-8) auto;
  text-align: center;
  padding: var(--space-10) var(--space-8);
}

.mode-selector__title {
  font-family: var(--font-heading);
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.mode-selector__subtitle {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin-bottom: var(--space-8);
}

.mode-selector__buttons {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.mode-selector__btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-6) var(--space-4);
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-xl, 16px);
  cursor: pointer;
  background: var(--glass-white);
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
}

.mode-selector__btn:hover,
.mode-selector__btn--active {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px var(--primary-glow);
}

.mode-selector__btn-label {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.mode-selector__btn-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.mode-selector__back {
  margin-top: var(--space-2);
}

@media (max-width: 640px) {
  .mode-selector__buttons {
    flex-direction: column;
  }
}
</style>
