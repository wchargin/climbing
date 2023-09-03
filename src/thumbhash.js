import { createContext, useContext, useRef } from "react";
import { thumbHashToAverageRGBA, thumbHashToDataURL } from "thumbhash";

import { useHydrated } from "./hydrated";

const ThumbhashCacheContext = createContext(null);

export function ThumbhashCacheProvider({ children }) {
  const cacheRef = useRef(null);
  if (cacheRef.current == null) cacheRef.current = new Map();
  return (
    <ThumbhashCacheContext.Provider value={cacheRef.current}>
      {children}
    </ThumbhashCacheContext.Provider>
  );
}

export default function useThumbhash(base64) {
  const cache = useContext(ThumbhashCacheContext);
  const hydrated = useHydrated();

  let entry = cache.get(base64);
  if (entry != null) return entry;
  entry = { averageColor: null, image: null };

  // `averageColor` is always available.
  const thumbHash = decodeThumbHashBase64(base64);
  entry.averageColor = rgbaObjectToHex(thumbHashToAverageRGBA(thumbHash));

  // `image` is only available on the client (and after initial render) because
  // the data URL is large so we don't want it to be in the document payload.
  if (hydrated) {
    const url = thumbHashToDataURL(thumbHash);
    const cssUrl = `url("${url}")`;
    entry.image = { url, cssUrl };
    cache.set(base64, entry);
  } else {
    entry.image = null;
  }

  return entry;
}

function decodeThumbHashBase64(hash) {
  const buf = atob(hash);
  const result = new Uint8Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    result[i] = buf.charCodeAt(i);
  }
  return result;
}

// Convert unit-interval floats to hex bytes.
function u2b(z) {
  return Math.floor(z * 255)
    .toString(16)
    .padStart(2, "0");
}
function rgbaObjectToHex({ r, g, b, a }) {
  return `#${u2b(r)}${u2b(g)}${u2b(b)}${u2b(a)}`;
}
