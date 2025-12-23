<!-- WIP code -->

<script>
  import { onMount } from 'svelte';

  let gridContainer;
  /** @type {{ x: number, y: number, color: string, id: number }[]} */
  let coloredSquares = [];

  const colors = [
    '#FF4AC6',
  ];

  function isValidPosition(x, y, existingSquares) {
    // Check if the new position is at least 3 cells away from all existing squares
    for (const square of existingSquares) {
      const distance = Math.max(Math.abs(x - square.x), Math.abs(y - square.y));
      if (distance < 3) {
        return false;
      }
    }
    return true;
  }

  function generateRandomSquares() {
    const squares = [];
    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loop
    
    while (squares.length < 15 && attempts < maxAttempts) {
      // Generate random position within expanded 15x15 area
      // Center it in the 20x30 grid: x from 2.5-17.5, y from 7.5-22.5
      const x = Math.floor(Math.random() * 13) + 4; // 3 to 17
      const y = Math.floor(Math.random() * 15) + 8; // 8 to 22
      
      if (isValidPosition(x, y, squares)) {
        squares.push({
          x,
          y,
          color: colors[0],
          id: squares.length
        });
      }
      
      attempts++;
    }
    
    console.log(`Generated ${squares.length} squares in ${attempts} attempts`);
    return squares;
  }

  onMount(() => {
    coloredSquares = generateRandomSquares();
  });
</script>

<style lang="scss">
  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
    transform: translateX(5px);
  }

  .grid-container {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(20, 1fr);
    grid-template-rows: repeat(30, 1fr);
    opacity: 1;
  }

  .grid-cell {
    border: 1px solid transparent;
    position: relative;
  }

  .colored-square {
    position: absolute;
    top: 0;
    left: 0;
    width: 105%;
    height: 105%;
    z-index: 10;
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  .colored-square:hover {
    opacity: 1;
  }

  /* Grid lines */
  .grid-cell:nth-child(20n) {
    border-right: 2px solid transparent;
  }

  .grid-cell:nth-child(n+581) {
    border-bottom: 2px solid transparent;
  }
</style>

<div class="grid-overlay">
  <div class="grid-container" bind:this={gridContainer}>
    <!-- Generate 600 grid cells (20x30) -->
    {#each Array(600) as _, index}
      {@const x = index % 20}
      {@const y = Math.floor(index / 20)}
      {@const coloredSquare = coloredSquares.find(square => square.x === x && square.y === y)}
      
      <div class="grid-cell">
        {#if coloredSquare}
          <div 
            class="colored-square"
            style="background-color: {coloredSquare.color};"
          ></div>
        {/if}
      </div>
    {/each}
  </div>
</div>