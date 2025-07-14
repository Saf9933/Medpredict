<template>
    <nav class="navbar">
      <!-- Logo -->
      <div class="logo">
        <img src="@/assets/logo.png" alt="Logo" />
        <span class="brand-text">Med<br />Predict</span>
      </div>
  
      <!-- Nav Buttons -->
      <div class="nav-buttons">
        <router-link to="/" class="nav-btn">Home</router-link>
        <router-link to="/classifier" class="nav-btn">Our AI Classifier</router-link>

      </div>
  
      <!-- Auth Buttons -->
      <div class="auth-buttons">
        <button class="text-btn">Register »</button>
        <button class="signup-btn">Sign Up</button>
      </div>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'AppNavbar'
  }
  </script>
  
  <style scoped>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 3rem;
    background-color: white;
    border-bottom: 1px solid #eee;
    font-family: 'Georgia', serif;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 0.05rem;
  }
  
  .logo img {
    width: 70px;
    height: auto;
  }
  
  .brand-text {
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 1.1;
  }
  
  .nav-buttons,
  .auth-buttons {
    display: flex;
    align-items: center;
    gap: 7rem;
  }
  
  .nav-btn {
    background-color: black;
    color: white;
    padding: 0.5rem 1.5rem;
    border-radius: 999px;
    font-weight: bold;
    text-decoration: none;
    font-size: 1rem;
    transition: background-color 0.2s ease;
  }
  
  .nav-btn:hover {
    background-color: #333;
  }
  
  .text-btn {
    background: none;
    border: none;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    padding: 0.5rem 1rem;
    color: black;
  }
  
  .signup-btn {
    background-color: #e0e0e0;
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    border: none;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
  }
  
  .signup-btn:hover {
    background-color: #ccc;
  }
  </style>
  