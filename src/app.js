import { useEffect, useMemo, useState } from "react";
import { thumbHashToAverageRGBA, thumbHashToDataURL } from "thumbhash";

import data from "./data.json";

function App() {
  const dataDesc = data.slice().reverse();
  return (
    <main>
      <h1 className="text-4xl font-bold pt-8 pb-4 mx-2">Routes climbed</h1>
      <div className="routes-grid grid gap-4 p-2">
        {dataDesc.map((route) => (
          <Route key={route.id} route={route} />
        ))}
      </div>
    </main>
  );
}

const CATEGORY_COLORS = {
  black: "#111111",
  blue: "#82a5d6",
  pink: "#f0b5ad",
};
const LOCATION_NAMES = {
  poplar: "SBP Poplar",
  fremont: "SBP Fremont",
};

function Route({ route }) {
  const title = `${route.category.replace(/\b./g, (c) => c.toUpperCase())} #${
    route.indexInCategory
  }`;
  const location = LOCATION_NAMES[route.location] ?? null;
  const categoryColor = CATEGORY_COLORS[route.category] ?? null;

  const [mounted, setMounted] = useState(false);
  useEffect(() => void setMounted(true), []);
  const thumbhashData = useMemo(() => {
    const thumbHash = decodeThumbHashBase64(route.thumbhash);
    const averageRgba = rgbaObjectToColor(thumbHashToAverageRGBA(thumbHash));
    // The data URL is never used on the server, so don't bother computing it.
    const isServer = typeof document === "undefined";
    const dataUrl = isServer ? null : thumbHashToDataURL(thumbHash);
    return { averageRgba, dataUrl };
  }, [route.thumbhash]);

  return (
    <a
      href={imageUrl(route.id, "full")}
      className="flex flex-col flex-grow justify-between border border-brand-600 rounded-sm"
    >
      <figure
        className="relative border-4 rounded-sm"
        style={{
          background: mounted
            ? `center / cover no-repeat url("${thumbhashData.dataUrl}")`
            : thumbhashData.averageRgba,
          borderColor: categoryColor,
        }}
      >
        <img
          src={imageUrl(route.id, "400")}
          loading="lazy"
          alt={`Photo of ${title}`}
          className="w-full h-full object-contain flex items-center justify-evenly italic"
          style={{ aspectRatio: "3 / 4" }}
        />
        <figcaption className="absolute bottom-0 w-full p-2 text-center bg-black/25 backdrop-blur-sm">
          <p className="text-sm">
            #{route.id} ({title})
          </p>
          <p className="text-xs">
            {route.date} &middot; {location}
          </p>
        </figcaption>
      </figure>
    </a>
  );
}

function imageUrl(id, size) {
  const imageId = String(id).padStart(4, "0");
  return `https://storage.googleapis.com/wchargin-climbing-public/${size}/${imageId}.jpg`;
}

function decodeThumbHashBase64(hash) {
  const buf = atob(hash);
  const result = new Uint8Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    result[i] = buf.charCodeAt(i);
  }
  return result;
}

function rgbaObjectToColor({ r, g, b, a }) {
  const u2b = (z) => Math.floor(z * 255);
  return `rgba(${u2b(r)}, ${u2b(g)}, ${u2b(b)}, ${a})`;
}

export default App;
