import { createAsync } from '../modules/async/async';

type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
let f: Fetch;
if (typeof window !== 'undefined') f = window.fetch;
export const setFetch = (fetch: Fetch) => { f = fetch; };

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export const postsResource = createAsync<Post[]>(() => f('https://jsonplaceholder.typicode.com/posts')
  .then(res => res.json() as Promise<Post[]>));

export const postResource = createAsync<Post, number>(id => f(`https://jsonplaceholder.typicode.com/posts/${id}`)
  .then(res => res.json() as Promise<Post>));
