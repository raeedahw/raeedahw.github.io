<script>
  import { MAX_WIDTH } from '$lib/constants';
  import Water from '$lib/Water.svelte';
  // import Grid from '$lib/Grid.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { base } from '$app/paths';

  let showBioContent = false;
  let timeInterval;

  $: backgroundImageUrl = `${base}/images/clouds.png`;
  $: if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--bg-image', `url(${backgroundImageUrl})`);
  }

  function handleBioClick() {
    showBioContent = !showBioContent;
  }

  function updateTimes() {
    const now = new Date();
    const londonTime = now.toLocaleTimeString('en-GB', {
      timeZone: 'Europe/London',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const nycTime = now.toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const londonElem = document.getElementById('london-time');
    if (londonElem) londonElem.textContent = londonTime;
    const nycElem = document.getElementById('nyc-time');
    if (nycElem) nycElem.textContent = nycTime;
  }

  onMount(() => {
    updateTimes();
    timeInterval = setInterval(updateTimes, 1000);
  });

  onDestroy(() => {
    clearInterval(timeInterval);
  });
</script>

<style lang="scss">
  :root {
    --m-s: 10px;
    --speed: 400ms;
    --ease: cubic-bezier(0.22, 1, 0.36, 1);
  }

  :global(*) {
    font-family: 'Inter', sans-serif !important;
  }

  :global(html, body) {
    background: var(--bg-image) center/cover no-repeat fixed;
    margin: 0;
    padding: 0;
    height: 100vh;
    overflow: hidden;
    position: fixed;
    width: 100%;
  }

  .water-background {
    position: fixed;
    inset: 0;
    z-index: 0;
    mix-blend-mode: multiply;
    pointer-events: none;
  }

  main {
    margin: 0 auto;
    padding: 0 40px;
    position: relative;
    z-index: 1;
    height: 100vh;
    overflow: hidden; 
    // max-height: 100vh;

    @media (max-width: 500px) {
      padding: 0 20px;
      height: 100vh;
      overflow: hidden;
    }
  }

  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    position: relative;
    overflow: hidden
    
  }

  .rectangle-container {
    width: 600px;
    height: 850px;
    position: relative;
    font-size: 18px;
    z-index: 2;

    @media (max-width: 768px) {
      width: 90vw;
      height: 90vh;
      max-width: 500px;
      max-height: 700px;
      font-size: 2.5vw;
    }

    @media (max-width: 480px) {
      width: 95vw;
      height: 85vh;
      max-width: 400px;
      max-height: 600px;
      font-size: 3vw; 
    }
  }

  .rectangle-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
    
  }

  .top-info {
    position: absolute;
    top: 2.2%;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 10;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: min(80px, 13vw); 
    width: min(280px, 47%);

    @media (max-width: 500px) {
      top: calc(1.5vh + 10px);
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      width: auto;
      font-size: 1.1em;
      opacity: 0.5;
    }

    .top-time-line {
      font-size: 0.8em;
      color: #FF4AC6;
      font-weight: 500;
      white-space: nowrap;

      @media (max-width: 500px) {
        color: white;
      }
    }
  }

  .nav-wrapper {
    position: absolute;
    top: 52%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 3.5%;
    z-index: 99;

    @media (max-width: 500px) {
      top: 8vh;
      padding: 0 4%;
      transform: none;
    }
  }

  .bio-text {
    cursor: pointer;
    background: none;
    border: none;
    font-size: 1em;
    color: #333;
    font-weight: bold;
    transition: opacity var(--speed) var(--ease), color 0.3s ease;
    pointer-events: auto;

    &.active {
      color: black;
      &:hover { color: #FF4AC6; }
    }
    &:hover { color: #FF4AC6; }

    @media (max-width: 500px) {
      font-size: 1em;
    }
  }

  .work-text-group {
    text-align: center;
    color: #333;
    font-weight: bold;
    font-size: 1em;
    transition: opacity var(--speed) var(--ease), color 0.3s ease;

    &:hover { color: #FF4AC6; }
    &.fade-out { opacity: 0; }

    @media (max-width: 500px) {
      font-size: 1em;
      line-height: 1.15;
    }
  }

  .coming-soon-text {
    color: #FF4AC6;
    font-weight: 400;
  }

  .work-text {
    position: relative;
    color: #333;
    font-weight: bold;
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #FF4AC6;
      transform: translateY(-50%);
    }
  }

  .bio-content {
    position: absolute;
    top: 50px;
    left: 3.5%;
    right: 20px;
    max-width: 500px;
    font-size: 12px;
    line-height: 1.3;
    z-index: 10;
    overflow: hidden;
    max-height: 0;
    padding: 0;
    transition: max-height 1.5s cubic-bezier(0.4, 0.2, 0, 1);
    pointer-events: none;
    display: grid;
    grid-template-columns: 1fr 4fr;
    gap: 15px;

    &.show {
      max-height: 400px;
      pointer-events: auto;

      @media (max-width: 768px) { max-height: 500px; }
      @media (max-width: 480px) { font-size: 0.85em; max-height: 600px; }
    }

    @media (max-width: 768px) {
      right: 15px;
      top: 80px;
      max-width: calc(100% - 30px);
      font-size: 11px;
      grid-template-columns: 1fr;
      gap: 12px;
    }

    @media (max-width: 500px) {
      left: 4%;
      right: 10px;
      top: 30%; 
      max-width: calc(100% - 30px);
      font-size: 0.85em;
      line-height: 1.15;
      gap: 8px;
    }
  }

  .bio-section {
    display: flex;
    flex-direction: column;

    &.full-width { grid-column: 1 / -1; }

    h3 {
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin: 0 0 5px 0;
      color: #666;

      @media (max-width: 768px) { font-size: 10px; margin: 0 0 4px 0; }
      @media (max-width: 500px) { font-size: 1em; margin: 0 0 5px 0; }
    }

    p {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 12px;
      line-height: 1.2;

      @media (max-width: 768px) { font-size: 11px; margin: 0 0 6px 0; line-height: 1.3; }
      @media (max-width: 500px) { font-size: 1em; }
    }

    .item {
      margin-bottom: 3px;
      font-size: 12px;
      line-height: 1.1;

      @media (max-width: 768px) { font-size: 11px; margin-bottom: 2px; line-height: 1.2; }
      @media (max-width: 500px) { font-size: 1em; line-height: 1; margin-bottom: 2px; }
    }
  }

  .bottom-text {
    position: absolute;
    bottom: 1%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.6em;
    opacity: 0.4;
    transition: opacity var(--speed) var(--ease);
    text-align: center;
    width: 90%;

    // &.fade-out { opacity: 0; }

    @media (max-width: 500px) {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      transform: none;
      font-size: 0.75em;
      opacity: 0.3;
      width: 100%;
    }
  }

  // a {
  //   color: black;
  //   text-decoration: none;
  //   &:hover { color: #FF4AC6 !important; transition: color 0.3s ease !important; }
  //   &:visited { color: black; }
  // }
</style>

<svelte:head>
  <title>RW</title>
</svelte:head>

<div class="water-background">
  <Water />
</div>

<main style="max-width: {MAX_WIDTH}px">
  <div class="container">
    <div class="rectangle-container">
      <img src="{base}/images/grid_notebook.png" alt="Grid Notebook" class="rectangle-image" />
      <div class="top-info">
        <div class="top-time-line">
          <span class="location">LDN</span> 
          <span class="time" id="london-time">00:00</span>
        </div>
        <div class="top-time-line">
          <span class="location">NYC</span> 
          <span class="time" id="nyc-time">00:00</span>
        </div>
      </div>
      <div class="nav-wrapper">
        <button 
          class="bio-text" 
          class:active={showBioContent}
          on:click={handleBioClick}
        >
          {showBioContent ? 'CLOSE' : 'BIO'}
        </button>
        <div class="work-text-group" class:fade-out={showBioContent}>
          <div class="coming-soon-text">COMING</div>
          <div class="work-text">WORK</div>
          <div class="coming-soon-text">SOON</div>
        </div>
      </div>
      <div class="bio-content" class:show={showBioContent}>
        <div class="bio-section full-width">
          <h4>Raeedah is a visual designer. Her work explores the intersection of web technologies, art and information.</h4>
          <p style="margin-top:-10px">Please e-mail for collaboration or inquires: raeedah.w[at]gmail.com</p>
        </div>
        <div class="bio-section">
          <h3>Languages</h3>
          <div class="item">English</div>
          <div class="item">Urdu (اُردُو)</div>
          <!-- <div class="item">French A1</div> -->
        </div>
        <div class="bio-section">
          <h3>Skills</h3>
          <div class="item">Digital design</div>
          <div class="item">Web development</div>
          <div class="item">3D modeling</div>
          <div class="item">Geospatial tools</div>
          <div class="item">Data processing</div>
        </div>
        <div class="bio-section full-width">
          <h3>Experience</h3>
          <div class="item">2022 – Present · Data Visualization @ Bloomberg L.P.</div>
        </div>
        <div class="bio-section full-width">
          <h3>Education</h3>
          <div class="item">2022 · Barnard College, Columbia University</div>
          <div class="item">B.A. Computer Science-Human Rights</div>
        </div>
      </div>
      <div class="bottom-text">© 2026 Raeedah Wahid رئدة واحد . All rights reserved.</div>
    </div>
  </div>
</main>
