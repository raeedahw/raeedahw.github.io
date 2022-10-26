<script>
  import Grid from './Grid.svelte';
  import SectionHeader from './SectionHeader.svelte';
  import { MAX_WIDTH } from './constants';
  import projects from './projects';
  import { onMount } from 'svelte';

  let contactFocused = false;

  let characters = ['✨'];

	let confetti = new Array(20).fill()
		.map((_, i) => {
			return {
				character: characters[i % characters.length],
				x: Math.random() * 100,
				y: -20 - Math.random() * 100,
				r: 0.1 + Math.random() * 1
			};
		})
		.sort((a, b) => a.r - b.r);

	onMount(() => {
		let frame;

		function loop() {
			frame = requestAnimationFrame(loop);

			confetti = confetti.map(emoji => {
				emoji.y += 0.5 * emoji.r;
				if (emoji.y > 240) emoji.y = -20;
				return emoji;
			});
		}

		loop();

		return () => cancelAnimationFrame(frame);
	});

</script>

{#each confetti as c}
	<emoji style="left: {c.x}%; top: {c.y}%">{c.character}</emoji>
{/each}

<style lang="scss">
  main {
    margin: 0 auto;
    padding: 0 40px;
  }

  header {
    display: flex;
    justify-content: space-between;
    margin: 18px 0 22px;

    div:last-child {
      text-align: right;
    }
  }

  .gray,
  .gray a {
    color: #888;
  }

  .resume,
  .resume a {
    font-size:22px;
    color: #888;
  }

  .nutgraf {
    // width: 40%;
    margin: 0 auto 21px;
    padding-right:50%;
  }

  .contact {
    margin-bottom: 60px;
    // font-family: Inconsolata;
    font-size: 17px;
    font-weight: 500;
    line-height: 24px;

    p {
      display: inline-block;
      padding: 3px 0;
      transition-duration: 0.1s;
    }

    b {
      font-weight: 800;
    }

    a {
      color: #121212;
      text-decoration: none;
      border-bottom: 1px solid #cdcdcd;
      &:hover {
        border-bottom-color: #121212;
      }
    }
    a:not(:nth-child(2)) {
      margin-right: 5px;
    }

    &.contactFocused {
      p {
        background-color: #fbe1c4;
      }
      a {
        border-bottom-color: rgba(255, 255, 255, 0.8);
        border-bottom-width: 1.5px;
      }
    }
  }

  footer {
    width: 56%;
    margin: 0 auto 40px;
  }

  .updated-text {
    // text-transform: uppercase;
    font-family: 'Helvetica';
    font-size: 16px;
    font-weight: 500;
    color: #666;
  }

  @media (max-width: 600px) {
    header {
      margin-bottom: 48px;
    }

    .nutgraf,
    footer {
      width: 100%;
    }
  }

	:global(body) {
		overflow: scroll;
	}
	emoji {
		position: absolute;
		font-size: 2vw;
		user-select: none;
    z-index: 1;
	}
</style>

<main style="max-width: {MAX_WIDTH}px">

  <header>
    <div>
      <p>
        <b>Raeedah Wahid</b>
      </p>
    </div>
    <div>
      <p class="resume"><a href="https://drive.google.com/file/d/1gETcUvbrBQdjRquSFIIRr0IqmDnvQZaw/view?usp=sharing" target="_blank">Resume</a></p>
    </div>
  </header>

  <p class="nutgraf"> Data and graphics person at <a href="https://www.bloomberg.com/authors/AVRj3DR7f7s/raeedah-wahid" target="_blank"><b>Bloomberg</b></a>.</p>
  <p class="nutgraf"> I'm an early-career journalist who studied computer science on the Vision, Graphics, Interaction, and Robotics track. (Also, human rights). I like telling visual stories centered around criminal justice and climate change.</p>

  <div class="nutgraf contact" class:contactFocused>
    <p>
      <!-- <svg style="color: rgb(249, 0, 149);" width="25" zoomAndPan="magnify" viewBox="0 0 30 30.000001" height="25" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="id1"><path d="M 3.460938 6.5625 L 26.539062 6.5625 L 26.539062 24.707031 L 3.460938 24.707031 Z M 3.460938 6.5625 " clip-rule="nonzero" fill="#f90095"></path></clipPath></defs><g clip-path="url(#id1)"><path fill="#f90095" d="M 24.230469 11.101562 L 15 16.769531 L 5.769531 11.101562 L 5.769531 8.832031 L 15 14.503906 L 24.230469 8.832031 Z M 24.230469 6.5625 L 5.769531 6.5625 C 4.492188 6.5625 3.472656 7.578125 3.472656 8.832031 L 3.460938 22.441406 C 3.460938 23.695312 4.492188 24.707031 5.769531 24.707031 L 24.230469 24.707031 C 25.507812 24.707031 26.539062 23.695312 26.539062 22.441406 L 26.539062 8.832031 C 26.539062 7.578125 25.507812 6.5625 24.230469 6.5625 " fill-opacity="1" fill-rule="nonzero"></path></g></svg> -->
      <svg style="color: rgb(255, 0, 149);" width="25" height="25" fill="currentColor" class="bi bi-twitter" viewBox="0 0 16 16"> <a href="https://twitter.com/raeedahwahid" target="_blank"><path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" fill="#ff0095"></path></a> </svg>
      <!-- <svg style="color: rgb(255, 0, 149);" width="25" height="25" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16"> <a href="https://github.com/raeedahw" target="_blank"> <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" fill="#ff0095"></path></a></svg> -->
      <svg style="color: rgb(249, 0, 149);" width="30" height="25" viewBox="0 0 450 500"><!--! Font Awesome Free 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2022 Fonticons, Inc. --><a href="https://github.com/raeedahw" target="_blank"><path d="M186.1 328.7c0 20.9-10.9 55.1-36.7 55.1s-36.7-34.2-36.7-55.1 10.9-55.1 36.7-55.1 36.7 34.2 36.7 55.1zM480 278.2c0 31.9-3.2 65.7-17.5 95-37.9 76.6-142.1 74.8-216.7 74.8-75.8 0-186.2 2.7-225.6-74.8-14.6-29-20.2-63.1-20.2-95 0-41.9 13.9-81.5 41.5-113.6-5.2-15.8-7.7-32.4-7.7-48.8 0-21.5 4.9-32.3 14.6-51.8 45.3 0 74.3 9 108.8 36 29-6.9 58.8-10 88.7-10 27 0 54.2 2.9 80.4 9.2 34-26.7 63-35.2 107.8-35.2 9.8 19.5 14.6 30.3 14.6 51.8 0 16.4-2.6 32.7-7.7 48.2 27.5 32.4 39 72.3 39 114.2zm-64.3 50.5c0-43.9-26.7-82.6-73.5-82.6-18.9 0-37 3.4-56 6-14.9 2.3-29.8 3.2-45.1 3.2-15.2 0-30.1-.9-45.1-3.2-18.7-2.6-37-6-56-6-46.8 0-73.5 38.7-73.5 82.6 0 87.8 80.4 101.3 150.4 101.3h48.2c70.3 0 150.6-13.4 150.6-101.3zm-82.6-55.1c-25.8 0-36.7 34.2-36.7 55.1s10.9 55.1 36.7 55.1 36.7-34.2 36.7-55.1-10.9-55.1-36.7-55.1z" fill="#f90095"></path></a></svg>
      <svg style="color: rgb(255, 0, 149);" width="30" height="23" fill="currentColor" class="bi bi-linkedin" viewBox="0 0 16 16"> <a href="https://www.linkedin.com/in/raeedah-wahid" target="_blank"> <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" fill="#ff0095"></path></a></svg>
    </p>
  </div>

  <Grid projects={projects.topLevel} />


  <footer>
    <SectionHeader empty />
    <p class="updated-text" style="font-size:16px"><b>Other work I've contributed to: </b><span style="text-transform: none;">
    <p class="updated-text">
      <ul>
        <li><a style="color:rgb(249, 0, 149)" href="https://www.bloomberg.com/graphics/2021-nyc-police-overtime-pay/">NYC Cops Log Millions of Overtime Hours. New Yorkers Don’t Feel Safer.</a><span style="text-transform: none;"></span></li>
        <li><a style="color:rgb(249, 0, 149)" href="https://www.bloomberg.com/graphics/2021-wall-street-transformation-in-two-decades-since-9-11-attacks/">In Wake of 9/11, Wall Street Is More of a Notion Than an Address.</a><span style="text-transform: none;"></span></li>
      </ul>
    </p>
    <p class="updated-text" style="padding-bottom:2%; font-size: 14px; color: #666; font-family:'IBM Plex Mono', monospace;"> Made under the <a style="color:#666" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>. Updated October 2022. <span style="text-transform: none;"></p>

    
  </footer>

</main>
