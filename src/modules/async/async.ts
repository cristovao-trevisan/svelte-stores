import { get, Readable, Writable, writable } from 'svelte/store';

type AsyncFunc<T, O> = (opts: O) => Promise<T>
type Subscriber<T> = (value: AsyncState<T>) => void
type Updater<T> = (value: T) => T

export interface AsyncState<T> {
  loading: boolean
  loaded: boolean
  data?: T
  error?: Error
}

export interface AsyncResource<T, O> {
  request (opts: O, reload?: boolean): Promise<T>
  use (opts:O): Readable<AsyncState<T>>
}

const initialState = <T> () : AsyncState<T> => ({
  loading: false,
  loaded: false,
  data: null,
  error: null,
});

const loadingState = <T> (curr : AsyncState<T>) : AsyncState<T> => ({
  ...curr,
  loading: true,
});

const successState = <T> (data: T) : AsyncState<T> => ({
  loaded: true,
  loading: false,
  error: null,
  data,
});

const errorState = <T=unknown> (err: Error) : AsyncState<T> => ({
  loaded: false,
  loading: false,
  error: err,
  data: null,
});


export function createAsync<T, O=void>(func: AsyncFunc<T, O>) : AsyncResource<T, O> {
  const storeMap = new Map<number,Writable<AsyncState<T>>>();

  function initStore (opts: O) {
    const hash = hashFnv32a(JSON.stringify(opts));
    if (!storeMap.has(hash)) {
      const store = writable(initialState<T>(), () => {
        request(opts, false);
      });
      storeMap.set(hash, store);
    }
    return storeMap.get(hash);
  }

  function update (run: Updater<AsyncState<T>>, opts: O) {
    const hash = hashFnv32a(JSON.stringify(opts));
    storeMap.get(hash).update(s => run(s));
  }

  function set (state: AsyncState<T>, opts: O) {
    const hash = hashFnv32a(JSON.stringify(opts));
    storeMap.get(hash).set(state);
  }

  async function request (opts: O, reload = true) {
    const store = initStore(opts);
    const state = get(store) as AsyncState<T>;
    if (!reload && (state.loaded || state.loading)) return state.data;
    try {
      update(loadingState, opts);
      const data = await func(opts);
      set(successState(data), opts);
      return data;
    } catch (e) {
      set(errorState(e), opts);
      return null;
    }
  }

  function use (opts:O): Readable<AsyncState<T>> {
    const store = initStore(opts);
    function subscribe (run: Subscriber<T>) {
      return store.subscribe(run);
    }
    return { subscribe };
  }

  return { request, use };
}

export function isReloading(state: AsyncState<unknown>) {
  return state.loaded && state.loading;
}

/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */
export function hashFnv32a(str = '', seed = undefined) {
  /*jshint bitwise:false */
  let i, l,
      hval = (seed === undefined) ? 0x811c9dc5 : seed;

  for (i = 0, l = str.length; i < l; i++) {
      hval ^= str.charCodeAt(i);
      hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }
  return hval >>> 0;
}
