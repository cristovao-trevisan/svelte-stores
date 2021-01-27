<script lang="ts">
  import Notification from '../components/Notification.svelte';
</script>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

<h1>Great success!</h1>

<p><strong>Try editing this file (src/routes/index.svelte) to test live reloading.</strong></p>

<Notification message="Test 1" />
<Notification message="Test 2" />
<!-- <Notification message="Test 3" /> -->

<style>
	h1, p {
		text-align: center;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		text-transform: uppercase;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}
	p {
		margin: 1em auto;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>
