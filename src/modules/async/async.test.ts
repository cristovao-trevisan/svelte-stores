import { createAsync, isReloading } from './async';

async function noop () { return; }

describe('async-store', () => {
  test('success routine with multiple options', async () => {
    const f = jest.fn((id: number) => Promise.resolve(id));
    const fStore = createAsync(f);

    const f1 = fStore.use(1);
    const f2 = fStore.use(2);
    
    const m1 = jest.fn();
    const m2 = jest.fn();
    f1.subscribe(m1);
    f2.subscribe(m2);

    await noop();
    expect(m1.mock.calls.length).toBe(2);
    expect(m2.mock.calls.length).toBe(2);
    expect(f.mock.calls.length).toBe(2);

    expect(f.mock.calls[0][0]).toBe(1);
    expect(f.mock.calls[1][0]).toBe(2);

    expect(m1.mock.calls[0][0]).toEqual({ loading: true, loaded: false, data: null, error: null });
    expect(m1.mock.calls[1][0]).toEqual({ loading: false, loaded: true, data: 1, error: null });

    expect(m2.mock.calls[0][0]).toEqual({ loading: true, loaded: false, data: null, error: null });
    expect(m2.mock.calls[1][0]).toEqual({ loading: false, loaded: true, data: 2, error: null });
  });

  test('multiple use with same options call f only once', async () => {
    const f = jest.fn((id: number) => Promise.resolve(id));
    const fStore = createAsync(f);

    const f1 = fStore.use(1);
    const f2 = fStore.use(1);

    const m1 = jest.fn();
    const m2 = jest.fn();
    f1.subscribe(m1);
    f2.subscribe(m2);

    await noop();
    expect(m2.mock.calls.length).toBe(2);
    
    expect(f.mock.calls.length).toBe(1);
    expect(f.mock.calls[0][0]).toBe(1)
    
    ;[m1, m2].forEach(m => {
      expect(m.mock.calls.length).toBe(2);
      expect(m.mock.calls[0][0]).toEqual({ loading: true, loaded: false, data: null, error: null });
      expect(m.mock.calls[1][0]).toEqual({ loading: false, loaded: true, data: 1, error: null });
    });
  });

  test('manually calling request should re-run f', async () => {
    const f = jest.fn((id: number) => Promise.resolve(id));
    const fStore = createAsync(f);

    const fs = fStore.use(1);
    
    const m = jest.fn();
    fs.subscribe(m);

    await noop();
    expect(m.mock.calls.length).toBe(2);
    expect(f.mock.calls.length).toBe(1);

    fStore.request(1);
    
    await noop();
    expect(m.mock.calls.length).toBe(4);
    expect(f.mock.calls.length).toBe(2)

    ;[
      { loading: true, loaded: false, data: null, error: null },
      { loading: false, loaded: true, data: 1, error: null },
      { loading: true, loaded: true, data: 1, error: null },
      { loading: false, loaded: true, data: 1, error: null },
    ].forEach((ex, i) => {
      expect(m.mock.calls[i][0]).toEqual(ex);
    })

    ;[false, false, true, false].forEach((ex, i) => {
      expect(isReloading(m.mock.calls[i][0])).toBe(ex);
    });
  });
});

