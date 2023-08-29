import { useEffect, useMemo, useState } from "react";
import { thumbHashToAverageRGBA, thumbHashToDataURL } from "thumbhash";

export default function useThumbhash(base64) {
  // `averageColor` is always available.
  const averageColor = useMemo(() => {
    const thumbHash = decodeThumbHashBase64(base64);
    return rgbaObjectToHex(thumbHashToAverageRGBA(thumbHash));
  }, [base64]);

  // `image` is only available on the client (and after initial render) because
  // the data URL is large so we don't want it to be in the document payload.
  const [image, setImage] = useState(null);
  useEffect(() => {
    const thumbHash = decodeThumbHashBase64(base64);
    const url = thumbHashToDataURL(thumbHash);
    const cssUrl = `url("${url}")`;
    setImage({ url, cssUrl });
  }, [base64]);

  return { averageColor, image };
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
