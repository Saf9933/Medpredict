<template>
  <div class="case-selector">
    <header class="case-selector__header">
      <h1 class="case-selector__title">Choose a Clinical Case</h1>
      <p class="case-selector__subtitle">
        Select a scenario below to begin your clinical simulation
      </p>
    </header>

    <div class="case-selector__grid">
      <div
        v-for="caseItem in cases"
        :key="caseItem.filename"
        class="case-card glass-card"
      >
        <div class="case-card__body">
          <h2 class="case-card__title">{{ caseItem.title }}</h2>
          <div class="case-card__badges">
            <span class="badge badge-primary case-card__badge">
              {{ caseItem.system }}
            </span>
            <span v-if="caseItem.estimated_duration" class="badge badge-ghost case-card__duration">
              {{ caseItem.estimated_duration }}
            </span>
          </div>
        </div>
        <div class="case-card__action">
          <button
            class="btn btn-primary btn-lg case-card__btn"
            @click="startSimulation(caseItem.filename)"
          >
            Start Simulation
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['start'])

const cases = ref([
  {
    title: 'Chest Pain in a 54-Year-Old',
    system: 'Cardiovascular',
    estimated_duration: '30 min',
    filename: 'cardio_stemi_case.json'
  },
  {
    title: 'Sudden loss of Breath',
    system: 'Respiratory',
    estimated_duration: '30 min',
    filename: 'resp_copd_case.json'
  },
  {
    title: 'Confused Elderly Patient',
    system: 'Neurology',
    estimated_duration: '30 min',
    filename: 'neuro_confusion_case.json'
  },
  {
    title: 'Severe Abdominal Pain',
    system: 'Gastrointestinal',
    estimated_duration: '30 min',
    filename: 'gi_abdopain_case.json'
  },
  {
    title: 'Fever After Travel',
    system: 'Infectious Disease',
    estimated_duration: '30 min',
    filename: 'id_fever_case.json'
  },
  {
    title: 'Agitated Young Adult',
    system: 'Psychiatry',
    estimated_duration: '30 min',
    filename: 'psych_agitation_case.json'
  },
  {
    title: 'Cough & Fever in Toddler',
    system: 'Pediatrics',
    estimated_duration: '30 min',
    filename: 'peds_cough_case.json'
  },
  {
    title: 'Family Disagrees About DNR',
    system: 'Ethics',
    estimated_duration: '30 min',
    filename: 'ethics_dnr_case.json'
  }
])

function startSimulation(filename) {
  emit('start', filename)
}
</script>

<style scoped>
/* ---- Layout ---- */
.case-selector {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-4) 0 var(--space-16);
}

/* ---- Header ---- */
.case-selector__header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.case-selector__title {
  font-family: var(--font-heading);
  font-size: var(--text-4xl);
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  letter-spacing: -0.02em;
}

.case-selector__subtitle {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin: 0;
}

/* ---- Grid ---- */
.case-selector__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: var(--space-6);
}

/* ---- Card ---- */
.case-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--space-8) var(--space-6);
  text-align: center;
  cursor: default;
}

.case-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.case-card__title {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.case-card__badges {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
  margin-top: var(--space-1);
}

.case-card__badge {
  /* kept for specificity */
}

.case-card__duration {
  font-size: var(--text-xs);
}

.case-card__action {
  display: flex;
  justify-content: center;
}

.case-card__btn {
  width: 100%;
  max-width: 220px;
}

/* ---- Responsive ---- */
@media (max-width: 640px) {
  .case-selector__title {
    font-size: var(--text-3xl);
  }

  .case-selector__grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}
</style>
