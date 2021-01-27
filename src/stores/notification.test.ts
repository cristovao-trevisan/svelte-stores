import { get } from 'svelte/store';
import { messages, currentMessage, enqueueMessage, NotificationMessage } from './notification';

const message: NotificationMessage = { message: 'test', type: 'info', timeout: 1000 };

test('notification system', () => {
  jest.useFakeTimers();
  let msg: NotificationMessage;

  // should enqueue message
  enqueueMessage(message.message, message.type, message.timeout);
  expect(get(messages)).toHaveLength(1);
  expect(get(messages)[0]).toStrictEqual(message);
  // should not remove message since there are no subscribers
  jest.runAllTimers();
  currentMessage.subscribe(m => { msg = m; });
  expect(get(messages)).toHaveLength(1);
  expect(msg).toStrictEqual(message);
  // should remove message since there is a subscriber
  jest.runAllTimers();
  expect(get(messages)).toHaveLength(0);
  expect(msg).toBeUndefined();

  // test queuing
  enqueueMessage('test2', message.type, message.timeout);
  enqueueMessage('test3', message.type, message.timeout);
  expect(get(messages)).toHaveLength(2);
  expect(msg.message).toBe('test2');
  jest.runTimersToTime(message.timeout * 1.5);
  expect(get(messages)).toHaveLength(1);
  expect(msg.message).toBe('test3');
  jest.runTimersToTime(message.timeout);
  expect(get(messages)).toHaveLength(0);
  expect(msg).toBeUndefined();

  jest.useRealTimers();
});
