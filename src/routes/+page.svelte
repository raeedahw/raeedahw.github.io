<script>
  import Grid from '$lib/Grid.svelte';
  import SectionHeader from '$lib/SectionHeader.svelte';
  import { MAX_WIDTH } from '$lib/constants';
  import projects from '$lib/projects';
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
    </div>
  </header>

  <p class="nutgraf"> Data and graphics person at <a href="https://www.bloomberg.com/authors/AVRj3DR7f7s/raeedah-wahid" target="_blank"><b>Bloomberg</b></a>.</p>
  <p class="nutgraf">  I live in New York City. I studied computer science on the Vision and Graphics track at Barnard College and Columbia University. (Also, human rights.)</p>
  <p class="nutgraf">Most recently, I was on the team recognized as a <a style="font-weight:700;color:#444;" href="https://www.pulitzer.org/finalists/staff-bloomberg" target="_blank">2024 Pulitzer Prize Finalist in Explantory Reporting</a>.</p>


  <!-- <div class="nutgraf contact" class:contactFocused>
    <p>
      <a style="all:unset;" href="https://twitter.com/raeedahwahid" target="_blank"><img class="x-logo-img" src="https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023_original.svg" alt="X logo" width="22" height="22"/></a>
      <svg style="color: rgb(249, 0, 149);" width="30" height="25" viewBox="0 0 450 500"><a href="https://github.com/raeedahw" target="_blank"><path d="M186.1 328.7c0 20.9-10.9 55.1-36.7 55.1s-36.7-34.2-36.7-55.1 10.9-55.1 36.7-55.1 36.7 34.2 36.7 55.1zM480 278.2c0 31.9-3.2 65.7-17.5 95-37.9 76.6-142.1 74.8-216.7 74.8-75.8 0-186.2 2.7-225.6-74.8-14.6-29-20.2-63.1-20.2-95 0-41.9 13.9-81.5 41.5-113.6-5.2-15.8-7.7-32.4-7.7-48.8 0-21.5 4.9-32.3 14.6-51.8 45.3 0 74.3 9 108.8 36 29-6.9 58.8-10 88.7-10 27 0 54.2 2.9 80.4 9.2 34-26.7 63-35.2 107.8-35.2 9.8 19.5 14.6 30.3 14.6 51.8 0 16.4-2.6 32.7-7.7 48.2 27.5 32.4 39 72.3 39 114.2zm-64.3 50.5c0-43.9-26.7-82.6-73.5-82.6-18.9 0-37 3.4-56 6-14.9 2.3-29.8 3.2-45.1 3.2-15.2 0-30.1-.9-45.1-3.2-18.7-2.6-37-6-56-6-46.8 0-73.5 38.7-73.5 82.6 0 87.8 80.4 101.3 150.4 101.3h48.2c70.3 0 150.6-13.4 150.6-101.3zm-82.6-55.1c-25.8 0-36.7 34.2-36.7 55.1s10.9 55.1 36.7 55.1 36.7-34.2 36.7-55.1-10.9-55.1-36.7-55.1z" fill="#f90095"></path></a></svg>
      <svg style="color: rgb(255, 0, 149);" width="30" height="23" fill="currentColor" class="bi bi-linkedin" viewBox="0 0 16 16"> <a href="https://www.linkedin.com/in/raeedah-wahid" target="_blank"> <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" fill="#ff0095"></path></a></svg>
    </p>
  </div> -->

  <br>

  <Grid projects={projects.topLevel} />


  <footer>
    <SectionHeader empty />
    <p class="updated-text" style="padding-bottom:2%; font-size: 14px; color: #666; font-family:'IBM Plex Mono', monospace;"> Made under the <a style="color:#666" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>. Updated July 2024. <span style="text-transform: none;"></p>

    
  </footer>

</main>
