<script>
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import Navbar from '$lib/components/Navbar.svelte';
    import { theme } from '$lib/stores/theme'; // Updated to match main page

    const team = [
      {
        name: 'Gamidi Surya Vardhin 22BDS0114',
        role: 'Frontend Developer',
        description: 'Crafted the responsive UI and interactive elements of Clean News. Specialized in Svelte, GSAP animations, and creating seamless user experiences.',
        image: 'vardhin.jpg'
      },
      {
        name: 'Vedant Seth 22BCE0393',
        role: 'Backend Developer',
        description: 'Architected the AI-powered news aggregation system, for content classification and personalized recommendations.',
        image: 'vedant.jpg'
      }
    ];
  
    onMount(() => {
      // Hero section animation
      gsap.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
      });
      
      gsap.from('.hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        delay: 0.3,
        ease: 'power3.out'
      });
  
      // Team member animations
      gsap.from('.team-member', {
        opacity: 0,
        y: 100,
        stagger: 0.3,
        duration: 1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.team-section',
          start: 'top 80%'
        }
      });
  
      // Profile image animations
      gsap.from('.profile-image', {
        scale: 0,
        rotation: 360,
        duration: 1.5,
        ease: 'elastic.out(1, 0.3)',
        scrollTrigger: {
          trigger: '.team-section',
          start: 'top 80%'
        }
      });
  
      // Tech stack animation
      gsap.from('.tech-item', {
        scale: 0,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: '.tech-stack',
          start: 'top 85%'
        }
      });
  
      // Particle animation
      initParticles();
    });
  
    function initParticles() {
      const canvas = document.getElementById('particle-canvas');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const particles = [];
      const particleCount = 100;
      
      // Update particle colors based on theme
      const getParticleColor = () => {
        if ($theme === 'dark') {
          return `rgba(150, 150, 255, ${Math.random() * 0.5 + 0.1})`;
        } else {
          return `rgba(100, 100, 255, ${Math.random() * 0.5 + 0.1})`;
        }
      };
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          color: getParticleColor(),
          speedX: Math.random() * 2 - 1,
          speedY: Math.random() * 2 - 1
        });
      }
      
      function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particleCount; i++) {
          const p = particles[i];
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          
          p.x += p.speedX;
          p.y += p.speedY;
          
          if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
          if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        }
      }
      
      animate();
      
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
      
      // Update particle colors when theme changes
      theme.subscribe(() => {
        for (let i = 0; i < particleCount; i++) {
          particles[i].color = getParticleColor();
        }
      });
    }
  </script>
  
  <Navbar />
  <svelte:head>
    <title>About Us | Clean News</title>
  </svelte:head>
  
  <canvas id="particle-canvas" class="particle-background"></canvas>
  
  <div class="about-container">
    <section class="hero-section">
      <h1 class="hero-title">The Team Behind <span class="highlight">Clean News</span></h1>
      <p class="hero-subtitle">
        We're passionate about delivering AI-curated news that cuts through the noise
      </p>
      <div class="hero-animation">
        <div class="pulse-circle"></div>
        <div class="pulse-circle delay-1"></div>
        <div class="pulse-circle delay-2"></div>
      </div>
    </section>
  
    <section class="team-section">
      <h2 class="section-title">Meet Our Team</h2>
      
      <div class="team-grid">
        {#each team as member, i}
          <div class="team-member glass">
            <div class="profile-image-container">
              <div class="profile-image" style="background-image: url('{member.image}')"></div>
              <div class="orbit">
                <div class="orbit-dot"></div>
              </div>
            </div>
            <div class="member-info">
              <h3>{member.name}</h3>
              <div class="role">{member.role}</div>
              <p>{member.description}</p>
            </div>
          </div>
        {/each}
      </div>
    </section>
  
    <section class="tech-stack">
      <h2 class="section-title">Our Technology Stack</h2>
      <div class="tech-grid">
        <div class="tech-item glass">
          <div class="tech-icon">🧠</div>
          <h3>AI Algorithms</h3>
          <p>Custom machine learning models for content analysis</p>
        </div>
        <div class="tech-item glass">
          <div class="tech-icon">⚡</div>
          <h3>Svelte</h3>
          <p>Lightning-fast reactive UI framework</p>
        </div>
        <div class="tech-item glass">
          <div class="tech-icon">🎭</div>
          <h3>GSAP</h3>
          <p>Professional-grade animations</p>
        </div>
        <div class="tech-item glass">
          <div class="tech-icon">🔄</div>
          <h3>Real-time Updates</h3>
          <p>Continuous news aggregation and processing</p>
        </div>
      </div>
    </section>
  
    <section class="mission-section">
      <div class="mission-content">
        <h2 class="section-title">Our Mission</h2>
        <p class="mission-text">
          At Clean News, we're reimagining how people consume information in the digital age. 
          By leveraging cutting-edge AI technology, we filter through the noise to deliver 
          personalized, relevant, and factual news content.
        </p>
        <p class="mission-text">
          Our platform is designed to save you time while keeping you informed about what 
          matters most to you.
        </p>
      </div>
    </section>
  </div>
  
  <style>
    /* Base styles */
    :global(body) {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      overflow-x: hidden;
      scroll-behavior: smooth;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
  
    .particle-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
    }
  
    .about-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
  
    .section-title {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 3rem;
      position: relative;
      color: var(--text-primary);
      transition: color 0.3s ease;
    }
  
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, #4776E6, #8E54E9);
      border-radius: 2px;
    }
  
    .highlight {
      background: linear-gradient(90deg, #4776E6, #8E54E9);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      font-weight: 700;
    }
  
    /* Hero section */
    .hero-section {
      height: 80vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      position: relative;
      padding: 2rem;
    }
  
    .hero-title {
      font-size: 4rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      line-height: 1.2;
      color: var(--text-primary);
      transition: color 0.3s ease;
    }
  
    .hero-subtitle {
      font-size: 1.5rem;
      max-width: 700px;
      margin-bottom: 3rem;
      color: var(--text-secondary);
      line-height: 1.6;
      transition: color 0.3s ease;
    }
  
    .hero-animation {
      position: absolute;
      bottom: 10%;
      left: 50%;
      transform: translateX(-50%);
    }
  
    .pulse-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: rgba(71, 118, 230, 0.1);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 2s infinite;
    }
  
    .delay-1 {
      animation-delay: 0.5s;
    }
  
    .delay-2 {
      animation-delay: 1s;
    }
  
    @keyframes pulse {
      0% {
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 0.8;
      }
      100% {
        transform: translate(-50%, -50%) scale(1.5);
        opacity: 0;
      }
    }
  
    /* Team section */
    .team-section {
      padding: 6rem 0;
    }
  
    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 4rem;
      margin-top: 2rem;
    }
  
    .team-member {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 2rem;
      border-radius: 16px;
      background: var(--card-bg);
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 30px var(--glass-shadow);
      transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
    }
  
    .team-member:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 40px var(--glass-shadow);
    }
  
    .profile-image-container {
      position: relative;
      width: 180px;
      height: 180px;
      margin-bottom: 2rem;
    }
  
    .profile-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      box-shadow: 0 10px 25px var(--glass-shadow);
      border: 5px solid var(--bg-secondary);
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }
  
    .orbit {
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      border: 2px dashed var(--glass-border);
      border-radius: 50%;
      animation: rotate 15s linear infinite;
      transition: border-color 0.3s ease;
    }
  
    .orbit-dot {
      position: absolute;
      width: 12px;
      height: 12px;
      background: linear-gradient(90deg, #4776E6, #8E54E9);
      border-radius: 50%;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      animation: pulse-small 2s infinite;
    }
  
    @keyframes rotate {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  
    @keyframes pulse-small {
      0% {
        transform: translateY(-50%) scale(0.8);
        opacity: 0.5;
      }
      50% {
        transform: translateY(-50%) scale(1.2);
        opacity: 1;
      }
      100% {
        transform: translateY(-50%) scale(0.8);
        opacity: 0.5;
      }
    }
  
    .member-info h3 {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
      transition: color 0.3s ease;
    }
  
    .role {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: linear-gradient(90deg, #4776E6, #8E54E9);
      color: white;
      border-radius: 20px;
      font-weight: 600;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
  
    .member-info p {
      color: var(--text-secondary);
      line-height: 1.6;
      transition: color 0.3s ease;
    }
  
    /* Tech stack section */
    .tech-stack {
      padding: 6rem 0;
    }
  
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }
  
    .tech-item {
      background: var(--card-bg);
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 5px 20px var(--glass-shadow);
      transition: transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
    }
  
    .tech-item:hover {
      transform: translateY(-10px);
    }
  
    .tech-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
  
    .tech-item h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--text-primary);
      transition: color 0.3s ease;
    }
  
    .tech-item p {
      color: var(--text-secondary);
      transition: color 0.3s ease;
    }
  
    /* Mission section */
    .mission-section {
      padding: 6rem 0;
      background: var(--about-gradient);
      border-radius: 16px;
      margin: 2rem 0;
      transition: background 0.3s ease;
    }
  
    .mission-content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      padding: 2rem;
    }
  
    .mission-text {
      font-size: 1.2rem;
      line-height: 1.8;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      transition: color 0.3s ease;
    }
  
    /* Glassmorphism styles */
    .glass {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      box-shadow: 0 8px 32px var(--glass-shadow);
      transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
  
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .hero-subtitle {
        font-size: 1.2rem;
      }
      
      .section-title {
        font-size: 2rem;
      }
      
      .team-grid {
        gap: 2rem;
      }
      
      .profile-image-container {
        width: 150px;
        height: 150px;
      }
    }
  </style>