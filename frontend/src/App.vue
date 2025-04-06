<!-- src/App.vue -->
<template>
  <div id="app">
    <div class="bg-animated" aria-hidden="true"></div>
    <div class="bg-orbs" aria-hidden="true">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>
    <NavigationBar />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppFooter />
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue'
import AppFooter from './components/AppFooter.vue'
export default {
  name: 'App',
  components: { NavigationBar, AppFooter }
}
</script>

<style>
@import './assets/design-system.css';
@import './assets/animations.css';

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  margin: 0;
  overflow-x: hidden;
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-1);
  -webkit-font-smoothing: antialiased;
}

h1,h2,h3,h4,h5,h6 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
}

a { color: var(--primary); text-decoration: none; }
::selection { background: rgba(61,153,112,0.18); }

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--bg-2); }
::-webkit-scrollbar-thumb { background: rgba(61,153,112,0.2); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(61,153,112,0.35); }

#app { position: relative; min-height: 100vh; }

.main-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: calc(76px + var(--space-8)) var(--space-6) var(--space-8);
}

/* Animated gradient */
.bg-animated {
  position: fixed; inset: 0; z-index: -3;
  background: linear-gradient(-45deg, var(--bg-1), var(--bg-2), var(--bg-3), var(--bg-4), var(--bg-2), var(--bg-1));
  background-size: 400% 400%;
  animation: gradientShift 25s ease infinite;
}

/* Floating orbs */
.bg-orbs { position: fixed; inset: 0; z-index: -2; pointer-events: none; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.45; }
.orb-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(61,153,112,0.20), transparent 70%);
  top: -8%; right: -3%;
  animation: floatOrb1 18s ease-in-out infinite;
}
.orb-2 {
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(200,169,110,0.18), transparent 70%);
  bottom: 8%; left: -6%;
  animation: floatOrb2 22s ease-in-out infinite;
}
.orb-3 {
  width: 360px; height: 360px;
  background: radial-gradient(circle, rgba(126,168,126,0.18), transparent 70%);
  top: 45%; right: 15%;
  animation: floatOrb3 20s ease-in-out infinite;
}
</style>
