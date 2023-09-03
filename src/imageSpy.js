import { useEffect, useState } from "react";

import { useHydrated } from "./hydrated";

// Note: this function has no side-effects but is not pure; it reads from the
// browser cache state.
function isImageCachedNow(url) {
  if (typeof document === "undefined") return false;

  const img = new Image();
  img.src = url;
  const complete = img.complete;
  img.src = "";
  return complete;
}

export function useImageSpy(url) {
  const hydrated = useHydrated();

  function spy(url) {
    let [loadedState, setLoadedState] = useState(() => {
      const complete = isImageCachedNow(url);
      return { url, complete };
    });
    if (loadedState.url !== url) {
      const complete = isImageCachedNow(url);
      setLoadedState((loadedState = { url, complete }));
    }

    useEffect(() => {
      if (loadedState.complete) return;

      const img = new Image();
      img.src = url;
      if (img.complete) {
        done();
        return;
      }

      function done() {
        setLoadedState({ url, complete: true });
        unregister();
      }
      function unregister() {
        img.removeEventListener("load", done);
        img.removeEventListener("error", done);
        img.src = "";
      }
      img.addEventListener("load", done);
      img.addEventListener("error", done);
      return unregister;
    }, [url]);

    return hydrated && loadedState.complete;
  }

  return spy(url);
}
