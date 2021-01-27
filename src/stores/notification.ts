import { writable, derived } from 'svelte/store';

export type NotificationType = 'info' | 'error' | 'success'
export interface NotificationMessage {
  message: string
  type: NotificationType
  timeout: number
}

let timeoutRunning = false;
export const messages = writable<NotificationMessage[]>([]);
export const currentMessage = derived(messages, ($messages) => {
  const $message = $messages[0];
  if (!timeoutRunning && $message) {
    const { timeout } = $message;
    timeoutRunning = true;
    setTimeout(() => {
      timeoutRunning = false;
      messages.update(ms => ms.slice(1));
    }, timeout);
  }
  return $message;
});

export const enqueueMessage = (message: string, type: NotificationType, timeout: number) => messages.update(state => ([
  ...state,
  { message, type, timeout },
]));
