<template>
  <div class="background-wrapper">
    <div class="main-container">
      <CaseSelector v-if="!caseData" @start="loadCase" />

      <SimulationRunner
        v-else
        :caseData="caseData"
        @back="reset"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CaseSelector from '@/components/CaseSelector.vue'
import SimulationRunner from '@/components/SimulationRunner.vue'

const caseData = ref(null)

async function loadCase(filename) {
  try {
    const res = await fetch(`/api/cases/${filename}`)
    caseData.value = await res.json()
  } catch (error) {
    console.error('Failed to load case:', error)
  }
}

function reset() {
  caseData.value = null
}
</script>

<style scoped>

.background-wrapper {
  min-height: 100vh;
  padding: 32px;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

.main-container {
  background-color: #ffffff;
  border-radius: 32px;
  padding: 40px;
  width: 100%;
  max-width: 1000px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  margin-top: 32px;
  margin-bottom: 32px;
}
</style>
