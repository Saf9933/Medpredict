<template>
    <div class="study-smarter-section">
      <h2 class="circle-title">Study Smarter</h2>
      <div class="circle-wrapper">
        <!-- Rotating Ring -->
        <div class="rotating-ring">
          <div
            v-for="(img, i) in icons"
            :key="i"
            class="circle-item"
            :style="getPositionStyle(i, icons.length)"
          >
            <!-- Counter-rotate wrapper -->
            <div class="rotate-fix">
              <div class="circle-bg">
                <img :src="require(`@/assets/${img}`)" alt="Icon" />
              </div>
            </div>
          </div>
        </div>
  
        <!-- Center Logo -->
        <div class="center-logo">
          <img src="@/assets/logo.png" alt="Center Logo" />
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "StudySmarter",
    data() {
      return {
        icons: [
          "1.png", "2.png", "3.png", "4.png",
          "5.png", "6.png", "7.png", "8.png"
        ]
      };
    },
    methods: {
      getPositionStyle(index, total) {
        const radius = 180;
        const offset = 37; // Half the icon size (75/2)
        const angle = (index / total) * 2 * Math.PI;
        const x = radius * Math.cos(angle) - offset;
        const y = radius * Math.sin(angle) - offset;
        return {
          transform: `translate(${x}px, ${y}px)`
        };
      }
    }
  };
  </script>
  
  <style scoped>
  .study-smarter-section {
    padding: 6rem 1rem;
    text-align: center;
  }
  
  .circle-title {
    font-size: 1.5rem;
    font-weight: 600;
    font-family: Georgia, serif;
    border-bottom: 1px solid #333;
    display: inline-block;
    padding-bottom: 0.5rem;
    margin-bottom: 3rem;
  }
  
  .circle-wrapper {
    position: relative;
    width: 500px;
    height: 500px;
    margin: 0 auto;
  }
  
  .circle-wrapper::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 380px;
    height: 380px;
    border: 1px solid #000;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
  }
  
  /* Rotating container */
  .rotating-ring {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    animation: spin 20s linear infinite;
  }
  
  /* Counter-rotate the icon to stay upright */
  .rotate-fix {
    animation: counter-spin 20s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  
  @keyframes counter-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  
  .circle-item {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;
  }
  
  .circle-bg {
    background-color: #000;
    border-radius: 50%;
    width: 75px;
    height: 75px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  
  .circle-bg img {
    width: 38px;
    height: 38px;
    object-fit: contain;
  }
  
  .center-logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 50%;
    width: 110px;
    height: 110px;
    box-shadow: 0 0 10px rgba(0,0,0,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }
  
  .center-logo img {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }
  </style>
  