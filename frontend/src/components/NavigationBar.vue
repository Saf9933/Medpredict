<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="navbar-inner">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="10" fill="url(#logo-grad)"/>
            <rect x="13" y="7" width="6" height="18" rx="2" fill="white"/>
            <rect x="7" y="13" width="18" height="6" rx="2" fill="white"/>
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stop-color="#3d9970"/>
                <stop offset="100%" stop-color="#2d7a56"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span class="logo-text">
          <span class="logo-med">Med</span><span class="logo-predict">Predict</span>
        </span>
      </router-link>

      <!-- Desktop Nav -->
      <div class="nav-links">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="nav-link"
          :class="{ active: $route.path === link.path }"
        >
          <span class="nav-link-icon" v-html="link.icon"></span>
          {{ link.label }}
        </router-link>
      </div>

      <!-- GitHub -->
      <div class="nav-actions">
        <a href="https://github.com/saf9933/Medpredict" target="_blank" rel="noopener" class="github-link">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </a>
      </div>

      <!-- Mobile Hamburger -->
      <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Menu">
        <span class="hamburger-line" :class="{ open: mobileOpen }"></span>
        <span class="hamburger-line" :class="{ open: mobileOpen }"></span>
        <span class="hamburger-line" :class="{ open: mobileOpen }"></span>
      </button>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-mobile">
      <div v-if="mobileOpen" class="mobile-menu">
        <router-link
          v-for="link in navLinks"
          :key="'m-' + link.path"
          :to="link.path"
          class="mobile-link"
          :class="{ active: $route.path === link.path }"
          @click="mobileOpen = false"
        >
          <span class="nav-link-icon" v-html="link.icon"></span>
          {{ link.label }}
        </router-link>
      </div>
    </transition>
  </nav>
</template>

<script>
export default {
  name: 'NavigationBar',
  data() {
    return {
      isScrolled: false,
      mobileOpen: false,
      navLinks: [
        { path: '/',           label: 'Home',       icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>' },
        { path: '/research',   label: 'Research',   icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>' },
        { path: '/classifier', label: 'AI Quiz',    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a4 4 0 014 4c0 1.95-2 3-2 5h-4c0-2-2-3.05-2-5a4 4 0 014-4z"/><line x1="10" y1="17" x2="14" y2="17"/><line x1="10" y1="20" x2="14" y2="20"/></svg>' },
        { path: '/symptoms',   label: 'Symptoms',   icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
        { path: '/flashcards', label: 'Flashcards', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
        { path: '/simulate',   label: 'Simulator',  icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>' },
        { path: '/textbook',   label: 'Textbook',   icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' },
      ]
    }
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  },
  watch: {
    '$route'() { this.mobileOpen = false }
  },
  methods: {
    onScroll() {
      this.isScrolled = window.scrollY > 20
    }
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-navbar);
  transition: all var(--duration-normal) var(--ease-out);
}

.navbar.scrolled {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: 0 4px 30px rgba(60, 80, 50, 0.06);
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-6);
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  color: var(--text-primary);
}

.logo-icon {
  width: 36px;
  height: 36px;
  transition: transform var(--duration-normal) var(--ease-spring);
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.logo:hover .logo-icon {
  transform: rotate(-8deg) scale(1.05);
}

.logo-text {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.logo-med { color: var(--text-primary); }
.logo-predict { color: var(--primary); }

/* Nav Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-heading);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-out);
}

.nav-link-icon {
  display: flex;
  align-items: center;
  opacity: 0.5;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.nav-link:hover {
  color: var(--primary);
  background: var(--primary-bg);
}

.nav-link:hover .nav-link-icon { opacity: 0.9; }

.nav-link.active {
  color: var(--primary-dark);
  background: var(--primary-bg);
  font-weight: 600;
}

.nav-link.active .nav-link-icon { opacity: 1; }

/* GitHub */
.nav-actions { display: flex; align-items: center; }

.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  transition: all var(--duration-fast) var(--ease-out);
}

.github-link:hover {
  color: var(--text-primary);
  background: var(--primary-bg);
}

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
}

.hamburger-line {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: all var(--duration-normal) var(--ease-out);
}

.hamburger-line.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger-line.open:nth-child(2) { opacity: 0; }
.hamburger-line.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile Menu */
.mobile-menu {
  display: none;
  flex-direction: column;
  padding: var(--space-2) var(--space-6) var(--space-6);
  background: rgba(243, 247, 237, 0.92);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-heading);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-out);
}

.mobile-link:hover,
.mobile-link.active {
  color: var(--primary);
  background: var(--primary-bg);
}

.slide-mobile-enter-active { transition: all var(--duration-normal) var(--ease-out); }
.slide-mobile-leave-active { transition: all var(--duration-fast) ease-in; }
.slide-mobile-enter-from,
.slide-mobile-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 860px) {
  .nav-links, .nav-actions { display: none; }
  .hamburger { display: flex; }
  .mobile-menu { display: flex; }
}
</style>
