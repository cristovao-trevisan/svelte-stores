<script lang="ts">
  import type { FieldsDeclaration } from '../modules/form/form';
  import type { NotificationMessage, NotificationType } from '../stores/notification';
  import { enqueueMessage } from '../stores/notification';
  import { createForm } from '../modules/form/form';
  import { greaterThan, required } from '../modules/form/validators';
  import Notification from '../components/Notification.svelte';

  const types: NotificationType[] = ['info', 'success', 'error']
  const fields: FieldsDeclaration<NotificationMessage> = {
    message: { validators: [required] },
    timeout: { validators: [required, greaterThan(0)] },
    type: { initialValue: 'info' },
  };
  const { values, errors, submit } = createForm<NotificationMessage>(fields, onSubmit);

  async function onSubmit(notification: NotificationMessage) {
    enqueueMessage(notification.message, notification.type, notification.timeout);
  }
</script>

<Notification />

<form on:submit|preventDefault={submit}>
  <div class="input-container">
    <input placeholder="Mensagem" type="text" bind:value={$values.message} class:error={!!$errors.message}>
    {#if $errors.message}
      <p class="error-message"> {$errors.message.message} </p>
    {/if}
  </div>

  <div class="input-container">
    <input placeholder="Duração (ms)" type="number" bind:value={$values.timeout} class:error={!!$errors.timeout}>
    {#if $errors.timeout}
      <p class="error-message"> {$errors.timeout.message} </p>
    {/if}
  </div>

  <select name="type" bind:value={$values.type} class:error={!!$errors.type}>
    {#each types as type}
       <option value={type}>{type}</option>
    {/each}
  </select>

  <div class="text-center max-w-md">
    <button> Notificar </button>
  </div>
</form>