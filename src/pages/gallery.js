import { Fragment } from "react";

import classNames from "../classNames";
import FadingImage from "../fadingImage";
import { imageUrl } from "../img";
import Link from "../link";
import { useTelescroll } from "../telescroll";
import useThumbhash from "../thumbhash";

import { useStore } from "../store/context";

function Gallery() {
  const { store } = useStore();

  const routesDesc = Array.from(store.routeHeaders.values()).sort(
    (a, b) => b.id - a.id,
  );
  const seasonsDesc = Array.from(store.seasons.values()).sort(
    (a, b) => b.fromRouteId - a.fromRouteId,
  );

  const bySeason = groupBySeason(routesDesc, seasonsDesc);
  return (
    <main className="flex flex-col max-w-[1200px] px-4 mx-auto">
      <h1 className="text-4xl mt-12 mx-2">Completed routes</h1>
      {bySeason.map(({ season, routes }) => (
        <Season key={season.id} season={season} routes={routes} />
      ))}
    </main>
  );
}

function Season({ season, routes }) {
  const colorCounts = new Map();
  for (const route of routes) {
    const k = route.category;
    colorCounts.set(k, (colorCounts.get(k) || 0) + 1);
  }
  const colorLabels = [];
  for (const category of Object.keys(CATEGORY_COLORS)) {
    const n = colorCounts.get(category);
    if (n == null) continue;
    colorLabels.push(
      <CategoryCountChip key={category} category={category} count={n} />,
    );
  }

  return (
    <>
      <div className="flex flex-row flex-wrap justify-between md:justify-start items-end mx-2 mt-8">
        <h2 className="text-2xl">{season.name}</h2>
        <div className="inline-flex text-xs md:ml-8 gap-2">
          {...colorLabels}
        </div>
      </div>
      {season.description.length > 0 && (
        <SeasonDescription
          className="m-2 mt-4 max-w-[600px]"
          description={season.description}
        />
      )}
      <div className="routes-grid grid gap-2 p-2">
        {routes.map((route) => (
          <Route key={route.id} route={route} />
        ))}
      </div>
    </>
  );
}

function CategoryCountChip({ category, count }) {
  const color = CATEGORY_COLORS[category];
  return (
    <span
      key={category}
      className={classNames(
        "block p-[1px] rounded-sm",
        color.dark && "bg-brand-500",
      )}
    >
      <span
        className={classNames(
          "block px-2 py-1 border-2 rounded-sm",
          color.dark && "bg-brand-600",
        )}
        style={{ borderColor: color.hex }}
      >
        {count} {category}
      </span>
    </span>
  );
}

function SeasonDescription({ description, className }) {
  const p = [];
  for (let i = 0; i < description.length; i++) {
    const node = description[i];
    if (typeof node === "string") {
      p.push(<Fragment key={i}>{node}</Fragment>);
      continue;
    }
    switch (node.type) {
      case "route":
        p.push(
          <Link
            key={i}
            to={`/routes/${node.id}/`}
            className="text-sky-300 hover:underline focus:underline active:text-red-600"
          >
            {node.text}
          </Link>,
        );
        break;
      default:
        throw new Error("Unknown node type: " + node.type);
    }
  }
  return <p className={className}>{...p}</p>;
}

const CATEGORY_COLORS = {
  black: { hex: "#111111", dark: true },
  blue: { hex: "#82a5d6", dark: false },
  pink: { hex: "#f0b5ad", dark: false },
};
const LOCATION_NAMES = {
  poplar: "SBP Poplar",
  fremont: "SBP Fremont",
};

function Route({ route }) {
  const { provideScroll } = useTelescroll();

  const title = `${route.category.replace(/\b./g, (c) => c.toUpperCase())} #${
    route.indexInCategory
  }`;
  const location = LOCATION_NAMES[route.location] ?? null;

  const categoryColor = CATEGORY_COLORS[route.category] ?? null;
  const border = categoryColor.dark ? "border-brand-500" : "border-transparent";

  const thumbhash = useThumbhash(route.thumbhash);

  return (
    <Link
      ref={provideScroll(`route#${route.id}`)}
      to={`/routes/${route.id}/`}
      className={classNames(
        "flex flex-col flex-grow justify-between rounded-sm border",
        border,
      )}
    >
      <figure
        className="relative border-4 rounded-sm"
        style={{ borderColor: categoryColor.hex }}
      >
        <div
          className="hover-fader"
          style={{
            background:
              thumbhash.image != null
                ? "center / cover no-repeat"
                : thumbhash.averageColor,
            backgroundImage: thumbhash.image?.cssUrl,
          }}
        >
          <FadingImage
            src={imageUrl(route.id, "400")}
            loading="lazy"
            alt={`Photo of ${title}`}
            className="w-full h-full object-contain flex items-center justify-evenly italic"
            style={{ aspectRatio: "3 / 4" }}
          />
        </div>
        <figcaption className="absolute bottom-0 w-full p-2 text-center bg-black/50 backdrop-blur-sm">
          <p className="text-sm">
            #{route.id} ({title})
          </p>
          <p className="text-xs">{route.date}</p>
        </figcaption>
      </figure>
    </Link>
  );
}

function groupBySeason(routes, seasons) {
  const result = [];
  let nextSeasonIdx = 0;
  let current = null;
  for (const route of routes) {
    if (current == null || route.id < current.season.fromRouteId) {
      current = { season: seasons[nextSeasonIdx++], routes: [] };
      result.push(current);
    }
    current.routes.push(route);
  }
  return result;
}

export default Gallery;
