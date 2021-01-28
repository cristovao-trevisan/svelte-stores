<script context="module">
  import { postsResource, setFetch } from '../stores/api';
  export async function preload() {
    setFetch(this.fetch);
    await postsResource.request(null, false);
	}
</script>

<script lang="ts">
  const posts = postsResource.use();
</script>

{#if $posts.loaded}
  {#each $posts.data as { title, body, id }}
    <a href="/post/{id}">
      <div class="rounded m-2 p-4 shadow border border-gray-300">
        <h1> {title} </h1>
        <p> {body} </p>
      </div>
    </a>
  {/each}
{:else if $posts.error}
  <div class="error-message"> {$posts.error.message} </div>
{:else}
  Loading...
{/if}
