import { get } from 'svelte/store';
import { messages, currentMessage, enqueueMessage, NotificationMessage } from './notification';

const message: NotificationMessage = { message: 'test', type: 'info', timeout: 1000 };

describe('notification system', () => {
  beforeAll(() => jest.useFakeTimers());
  afterAll(() => jest.useRealTimers());
  
  test('should work', () => {
    let msg: NotificationMessage;
    // should enqueue message
    enqueueMessage(message.message, message.type, message.timeout);
    expect(get(messages)).toHaveLength(1);
    expect(get(messages)[0]).toStrictEqual(message);
    // should not remove message since there are no subscribers
    jest.runAllTimers();
    const un = currentMessage.subscribe(m => { msg = m; });
    expect(get(messages)).toHaveLength(1);
    expect(msg).toStrictEqual(message);
    // should remove message since there is a subscriber
    jest.runAllTimers();
    expect(get(messages)).toHaveLength(0);
    expect(msg).toBeUndefined();
    un();
  });
  
  test('should queue with multiple subscribers', () => {
    let msg: NotificationMessage;
    const un1 = currentMessage.subscribe(m => { msg = m; });
    const un2 = currentMessage.subscribe(m => { msg = m; });
    // test queuing
    enqueueMessage('test2', message.type, message.timeout);
    enqueueMessage('test3', message.type, message.timeout);
    jest.runTimersToTime(message.timeout * 1.5);
    expect(get(messages)).toHaveLength(1);
    expect(msg.message).toBe('test3');
    jest.runTimersToTime(message.timeout);
    expect(get(messages)).toHaveLength(0);
    expect(msg).toBeUndefined();
    un1(); un2();
  });
});
