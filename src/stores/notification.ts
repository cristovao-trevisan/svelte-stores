import { writable, derived } from 'svelte/store';

export type NotificationType = 'info' | 'error' | 'success'
export interface NotificationMessage {
  message: string
  type: NotificationType
  timeout: number
}

export const messages = writable<NotificationMessage[]>([]);
export const currentMessage = derived(messages, ($messages) => {
  const $message = $messages[0];
  if ($message) {
    const { timeout } = $message;
    setTimeout(() => {
      messages.set($messages.slice(1));
    }, timeout);
  }
  return $message;
});

export const enqueueMessage = (message: string, type: NotificationType, timeout: number) => messages.update(state => ([
  ...state,
  { message, type, timeout },
]));
