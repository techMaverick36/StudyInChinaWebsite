import { useState } from 'react'

interface HeroBackdropProps {
  /* The full photograph. Without one, the striped placeholder shows. */
  src?: string
  /* Tiny inline preview of the same photo, shown while the full file loads
     so the banner never flashes empty navy. */
  blur?: string
  /* CSS object-position, e.g. "center right". */
  position?: string
}

/* Banner background for every page hero.

   The photo is a real <img> rather than a CSS background so the browser's
   preload scanner starts fetching it immediately, and it carries
   fetchPriority="high" because it is the largest thing on screen. Until it
   arrives, a ~1 KB inline preview of the same image fills the space. */
export default function HeroBackdrop({ src, blur, position = 'center' }: HeroBackdropProps) {
  const [loaded, setLoaded] = useState(false)

  if (!src) return <div className="page-hero-stripes" />

  return (
    <>
      {blur && (
        <div
          className="hero-backdrop-blur"
          style={{ backgroundImage: `url(${blur})`, backgroundPosition: position }}
        />
      )}
      <img
        className={`hero-backdrop-img${loaded ? ' loaded' : ''}`}
        src={src}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        style={{ objectPosition: position }}
        onLoad={() => setLoaded(true)}
      />
    </>
  )
}
