<!-- src/App.vue -->
<template>
  <div id="app">
    <img class="dna-bg" src="./assets/dna.png" alt="DNA background" />
    <Navbar />
    <main>
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
import AppFooter from './components/AppFooter.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    AppFooter
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
  font-family: 'Georgia', serif;
  background-color: white;
}

.dna-bg {
  position: absolute;
  top: 300px;
  left: -20%;
  width: 140%;
  transform: rotate(-20deg);
  opacity: 1;
  z-index: -1;
  pointer-events: none;
}

#app {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

main {
  padding: 2rem 3rem;
}
</style>
