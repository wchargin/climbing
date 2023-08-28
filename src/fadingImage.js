import { useEffect, useRef, useState } from "react";

function FadingImage({ src, className, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (ref.current == null) return;
    if (ref.current.complete) setLoaded(true);
  }, [src]);
  function onLoad(e) {
    setLoaded(true);
    if (rest.onLoad) rest.onLoad.call(this, e);
  }
  function onError(e) {
    setLoaded(true);
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
