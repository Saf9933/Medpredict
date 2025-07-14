<!-- src/components/AppFooter.vue -->
<template>
  <footer class="site-footer">
    <div class="footer-content">
      <p>© 2025 MedPredict. All rights reserved.</p>
      <div class="footer-links">
        <a href="/name">Filali Salma</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy Policy</a>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter'
}
</script>

<style scoped>
.site-footer {
  margin-top: 6rem;
  padding: 2rem 1rem;
  background-color: #f8f8f8;
  color: #333;
  text-align: center;
  border-top: 1px solid #ccc;
  font-family: 'Georgia', serif;
  font-size: 0.95rem;
}

.footer-content {
  max-width: 1100px;
  margin: 0 auto;
}

.footer-links {
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.footer-links a {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #a94442;
}
</style>
