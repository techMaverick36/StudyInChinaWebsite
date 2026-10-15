import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/* False while React is taking over a prerendered page (and during the
   prerender itself), true afterwards and on every page reached by clicking a
   link. Anything the static HTML cannot know, such as the URL's ?query or
   today's date, waits for true so the first browser render matches the HTML;
   React then re-renders with the real value straight away. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
