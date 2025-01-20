<template>
  <div class="case-selector-wrapper">
    <!-- Title -->
    <h1 class="title">🩺 Choose a Clinical Case</h1>

    <!-- Cards Grid -->
    <div class="cards-grid">
      <div
        v-for="caseItem in cases"
        :key="caseItem.filename"
        class="case-card"
      >
        <h2 class="card-title">{{ caseItem.title }}</h2>
        <p class="card-subtitle">{{ caseItem.system }} Case</p>
        <div class="emoji">{{ caseItem.emoji }}</div>
        <hr class="divider" />
        <button @click="startSimulation(caseItem.filename)" class="start-button">
          Start simulation
        </button>
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
    filename: 'cardio_stemi_case.json'
  },
  {
    title: 'Sudden loss of Breath',
    system: 'Respiratory',

    filename: 'resp_copd_case.json'
  },
  {
    title: 'Confused Elderly Patient',
    system: 'Neurology',

    filename: 'neuro_confusion_case.json'
  },
  {
    title: 'Severe Abdominal Pain',
    system: 'Gastrointestinal',
  
    filename: 'gi_abdopain_case.json'
  },
  {
    title: 'Fever After Travel',
    system: 'Infectious Disease',

    filename: 'id_fever_case.json'
  },
  {
    title: 'Agitated Young Adult',
    system: 'Psychiatry',

    filename: 'psych_agitation_case.json'
  },
  {
    title: 'Cough & Fever in Toddler',
    system: 'Pediatrics',

    filename: 'peds_cough_case.json'
  },
  {
    title: 'Family Disagrees About DNR',
    system: 'Ethics',

    filename: 'ethics_dnr_case.json'
  }
])

function startSimulation(filename) {
  emit('start', filename)
}
</script>

<style scoped>
.case-selector-wrapper {
  padding: 80px 24px;
  max-width: 1200px;
  margin: auto;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: 'Segoe UI', sans-serif;
}

.title {
  font-size: 36px;
  font-weight: 800;
  text-align: center;
  margin-bottom: 64px;
  color: #222;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.case-card {
  background-color: #f9f8f8;
  padding: 40px 32px;
  border-radius: 24px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: 0.3s ease;
}

.case-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #111;
}

.card-subtitle {
  font-size: 16px;
  color: #444;
  margin-bottom: 20px;
}

.emoji {
  font-size: 28px;
  margin-bottom: 24px;
}

.divider {
  border: none;
  border-top: 1px solid #aaa;
  width: 75%;
  margin: 0 auto 24px auto;
}

.start-button {
  background-color: #8b1c13;
  color: white;
  font-size: 16px;
  font-weight: bold;
  padding: 12px 24px;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.start-button:hover {
  background-color: #a62019;
}
</style>
