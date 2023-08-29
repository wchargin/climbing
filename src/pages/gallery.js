import { Fragment } from "react";

import classNames from "../classNames";
import FadingImage from "../fadingImage";
import { imageUrl } from "../img";
import Link from "../link";
import useThumbhash from "../thumbhash";

import { useStore } from "../store/context";

function Gallery() {
  const { store } = useStore();

  const dataDesc = Array.from(store.routeHeaders.values()).sort(
    (a, b) => b.id - a.id,
  );

  const bySeason = groupBySeason(dataDesc);
  return (
    <main className="flex flex-col max-w-[1200px] px-4 mx-auto">
      <h1 className="text-4xl mt-12 mx-2">Completed routes</h1>
      {bySeason.map(({ season, routes }) => (
        <Season key={season} season={season} routes={routes} />
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
        <h2 className="text-2xl">{season}</h2>
        <div className="inline-flex text-xs md:ml-8 gap-2">
          {...colorLabels}
        </div>
      </div>
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
  const bg = color.dark ? "bg-brand-500" : "bg-transparent";
  return (
    <span key={category} className={classNames("block p-[1px] rounded-sm", bg)}>
      <span
        className="block px-2 py-1 border-2 rounded-sm"
        style={{ borderColor: color.hex }}
      >
        {count} {category}
      </span>
    </span>
  );
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
  const title = `${route.category.replace(/\b./g, (c) => c.toUpperCase())} #${
    route.indexInCategory
  }`;
  const location = LOCATION_NAMES[route.location] ?? null;

  const categoryColor = CATEGORY_COLORS[route.category] ?? null;
  const border = categoryColor.dark ? "border-brand-500" : "border-transparent";

  const thumbhash = useThumbhash(route.thumbhash);

  return (
    <Link
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

function groupBySeason(routes) {
  const seasons = [];
  let current = null;
  for (const route of routes) {
    const thisSeason = seasonName(route.date);
    if (current == null || current.season !== thisSeason) {
      current = { season: thisSeason, routes: [] };
      seasons.push(current);
    }
    current.routes.push(route);
  }
  return seasons;
}

const DATE_RE = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
function seasonName(dateStr) {
  const match = dateStr.match(DATE_RE);
  if (match == null) throw new Error("Invalid date: " + dateStr);
  const year = Number(match[1]);
  const month = Number(match[2]);

  // Use months for now for richer data.
  return (
    [
      "December",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "November",
    ][month % 12] +
    " " +
    year
  );

  const seasonIdx = Math.floor((month % 12) / 3);
  const season = ["Winter", "Spring", "Summer", "Fall"][seasonIdx];
  return `${season} ${year}`;
}

export default Gallery;
