<script context="module">
  import { postResource, setFetch } from '../../stores/api';
  export async function preload({ params }) {
    const id = Number(params.id);
    setFetch(this.fetch);
    await postResource.request(id, false);
    return { id };
  }
</script>

<script lang="ts">
  export let id: number;

  const post = postResource.use(id);
</script>

{#if $post.loaded}
  <div class="rounded m-2 p-4 shadow border border-gray-300">
    <h1> {$post.data.title} </h1>
    <p> {$post.data.body} </p>
  </div>
{:else if $post.error}
  <div class="error-message"> {$post.error.message} </div>
{:else}
  Loading...
{/if}
