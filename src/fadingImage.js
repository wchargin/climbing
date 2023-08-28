import { useEffect, useMemo, useRef, useState } from "react";

import { useHydrated } from "./hydrated";

function FadingImage({ src, className, ...rest }) {
  const [loadedState, setLoadedState] = useState({});
  const hydrated = useHydrated();
  const ref = useRef();

  const loaded = useMemo(() => {
    if (loadedState[src]) return true;
    if (hydrated) {
      const img = new Image();
      img.src = src;
      const complete = img.complete;
      img.src = "";
      if (complete) return true;
    }
    return false;
  }, [loadedState, src, hydrated]);

  function markLoaded() {
    setLoadedState({ ...loadedState, [src]: true });
  }
  useEffect(() => {
    if (ref.current == null) return;
    if (ref.current.complete) markLoaded();
  }, [src]);
  function onLoad(e) {
    markLoaded();
    if (rest.onLoad) rest.onLoad.call(this, e);
  }
  function onError(e) {
    markLoaded();
    if (rest.onError) rest.onError.call(this, e);
  }

  const classNames = [
    className,
    "transition-opacity duration-300",
    loaded || "js-opacity-0",
  ];
  return (
    <img
      {...rest}
      onLoad={onLoad}
      onError={onError}
      ref={ref}
      src={src}
      className={classNames.filter(Boolean).join(" ")}
    />
  );
}

export default FadingImage;
