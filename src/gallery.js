import FadingImage from "./fadingImage";
import { imageUrl } from "./img";
import Link from "./link";
import useThumbhash from "./thumbhash";

import { useStore } from "./store/context";

function Gallery() {
  const { store } = useStore();

  const dataDesc = Array.from(store.routeHeaders.values()).sort(
    (a, b) => b.id - a.id,
  );
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

  const thumbhash = useThumbhash(route.thumbhash);

  return (
    <Link
      to={`/routes/${route.id}/`}
      className="flex flex-col flex-grow justify-between border border-brand-600 rounded-sm"
    >
      <figure
        className="relative border-4 rounded-sm"
        style={{
          background:
            thumbhash.image != null
              ? "center / cover no-repeat"
              : thumbhash.averageColor,
          backgroundImage: thumbhash.image?.cssUrl,
          borderColor: categoryColor,
        }}
      >
        <FadingImage
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
    </Link>
  );
}

export default Gallery;
