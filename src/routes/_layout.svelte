
<script lang="ts">
  import Nav from '../components/Nav.svelte';

  export let segment: string;
</script>

<style global>
  @import "../style/colors.css";
  @import "../style/global.css";
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>
