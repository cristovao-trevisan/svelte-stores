<script context="module" lang="ts">
  let instances: {}[] = [];
</script>

<script lang="ts">
  import type { NotificationType } from '../stores/notification'
  import { onDestroy } from 'svelte'
  import { slide } from 'svelte/transition'
  import { currentMessage, enqueueMessage } from '../stores/notification'

  export const addMessage = enqueueMessage
  export let message: string = null
  export let type: NotificationType = 'info'
  export let timeout = 2000

  if (message) enqueueMessage(message, type, timeout)
  const id = {};
  instances.push(id);
  onDestroy(() => {
    const idx = instances.indexOf(id);
    instances = [...instances.slice(0, idx), ...instances.slice(idx+1)];
  });
</script>

{#if $currentMessage}
  {#key $currentMessage}
    {#if id === instances[0]}
      <div class="notification" transition:slide={{}}>
        <p class="notification-item {$currentMessage.type}">
          {$currentMessage.message}	
        </p>
      </div>
    {/if}
  {/key}
{/if}


<style>
  .notification { @apply fixed flex bottom-0 pb-4 w-full; }
  .notification-item {
    @apply mx-auto max-w-xs rounded py-2 px-4 text-center border shadow;
    min-width: 20%;
  }
  .info { @apply bg-blue-200 border-blue-500; }
  .error { @apply bg-red-200 border-red-500; }
  .success { @apply bg-green-200 border-green-500; }
</style>
