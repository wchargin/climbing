import { Fragment, useState } from "react";

import classNames from "../classNames";
import FadingImage from "../fadingImage";
import Holds, { useHoldsState } from "../holds";
import { imageUrl } from "../img";
import Link from "../link";
import { CATEGORIES, LOCATION_NAMES } from "../metadata";
import useThumbhash from "../thumbhash";

import { useStore } from "../store/context";

function capitalize(s) {
  return s.replace(/\b./g, (c) => c.toUpperCase());
}

function Route({ id }) {
  const { store } = useStore();
  const [showHolds, setShowHolds] = useState(true);

  const route = store.routes.get(id);
  if (route == null) throw new Error("No such route: " + id);
  const thumbhash = useThumbhash(route.thumbhash);

  const holdsState = useHoldsState(id, imageUrl(route.id, "1200"));

  const prevInCategory = store.resolveCategoryAndIndex(
    route.category,
    route.indexInCategory - 1,
  );
  const nextInCategory = store.resolveCategoryAndIndex(
    route.category,
    route.indexInCategory + 1,
  );

  return (
    <main className="w-full flex flex-col items-start md:grid md:grid-cols-2 md:gap-[2rem] md:p-[2rem]">
      <div className="relative w-full h-full">
        <div className="md:max-h-auto flex justify-center md:justify-end md:absolute md:right-0 md:top-0 md:bottom-0 md:h-full">
          <div className="route-image-holder flex flex-col justify-start items-center">
            <Holds
              placeholder={{
                color: thumbhash.averageColor,
                src: thumbhash.image?.url,
              }}
              viewBox={route.annotations?.viewBox ?? [3024, 4032]}
              holds={route.annotations?.holds ?? []}
              showHolds={showHolds}
              state={holdsState}
              className="max-w-full max-h-full md:h-auto md:w-full"
              style={{ aspectRatio: "3 / 4" }}
            />
            <div className="text-center text-sm md:text-xs py-1 text-muted bg-transparent">
              {
                // ^ want bg-black/25 but can't figure out layout to make that
                // only extend to SVG width, not screen width
              }
              <a
                href={imageUrl(route.id, "full")}
                className="text-link text-muted"
              >
                see full image
              </a>
              {route.annotations && (
                <span className="nojs-hidden">
                  <span className="mx-2">&middot;</span>
                  <ShowHideHolds value={showHolds} set={setShowHolds} />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 md:mt-0 tall:mt-12 w-full h-full lg:max-w-[600px] px-6 lg:px-0">
        <div className="flex items-center">
          <h1 className="flex-grow">
            {CATEGORIES[route.category].title} #{route.indexInCategory}
          </h1>
          <NavAdjacentLink
            id={prevInCategory}
            current={route}
            isNext={false}
            byCategoryIndex={true}
          />
          <NavAdjacentLink
            id={nextInCategory}
            current={route}
            isNext={true}
            byCategoryIndex={true}
          />
        </div>
        <div className="flex items-center">
          <h2 className="text-muted mt-2 flex-grow">Route #{route.id}</h2>
          <NavAdjacentLink
            id={id - 1}
            current={route}
            isNext={false}
            byCategoryIndex={false}
          />
          <NavAdjacentLink
            id={id + 1}
            current={route}
            isNext={true}
            byCategoryIndex={false}
          />
        </div>
        <h2 className="text-muted mt-2">
          {route.date} &middot; {LOCATION_NAMES[route.location]}
        </h2>
        <Notes className="mt-6" notes={route.notes} holdsState={holdsState} />
        <p className="mt-6">
          <Link to="/" scrollTo={`route#${id}`} className="text-link block">
            &laquo; Back to route gallery
          </Link>
        </p>
      </div>
    </main>
  );
}

function NavAdjacentLink({ id, current, isNext, byCategoryIndex }) {
  const { store } = useStore();
  const header = store.routeHeaders.get(id);
  const enabled = header != null;

  let to = null;
  if (enabled) {
    if (byCategoryIndex) {
      to = `/routes/${header.category}/${header.indexInCategory}/`;
    } else {
      to = `/routes/${header.id}/`;
    }
  }

  let arrow;
  if (isNext) {
    arrow = "M 6 5.5 L 14 10 L 6 14.5";
  } else {
    arrow = "M 14 5.5 L 6 10 L 14 14.5";
  }

  let title;
  const preposition = isNext ? "next" : "previous";
  const relativity = byCategoryIndex ? `${current.category} ` : "";
  if (enabled) {
    title = `${capitalize(preposition)} ${relativity}route`;
    if (byCategoryIndex) {
      title += ` (${capitalize(header.category)} #${header.indexInCategory})`;
    } else {
      title += ` (#${header.id})`;
    }
  } else {
    title = `No ${preposition} ${relativity}route`;
  }

  return (
    <Link
      to={to}
      className={classNames(
        "ml-2",
        enabled
          ? "text-brand-700 hover:text-brand-600 active:text-brand-900"
          : "text-brand-600",
      )}
      title={title}
    >
      <svg
        viewBox="0 0 20 20"
        width={28}
        height={28}
        alt={isNext ? "Next" : "Previous"}
      >
        <rect width={20} height={20} rx={1.5} ry={1.5} fill="currentColor" />
        <path
          d={arrow}
          className={enabled ? "fill-brand-100" : "fill-brand-400"}
        />
      </svg>
    </Link>
  );
}

function ShowHideHolds({ value, set }) {
  function btn(state, children) {
    const active = value === state;
    return (
      <button
        onClick={() => void set(state)}
        className={classNames(active && "underline")}
      >
        {children}
      </button>
    );
  }
  return (
    <>
      holds: {btn(false, "hide")} / {btn(true, "show")}
    </>
  );
}

function Notes({ notes, holdsState, className }) {
  const children = [];
  let currentP = [];
  function clearP(key) {
    if (currentP.length > 0) {
      children.push(<p key={key}>{...currentP}</p>);
      currentP = [];
    }
  }

  for (let i = 0; i < notes.length; i++) {
    const node = notes[i];
    if (typeof node === "string") {
      currentP.push(<Fragment key={i}>{node}</Fragment>);
      continue;
    }
    switch (node.type) {
      case "p":
        clearP(i);
        break;
      case "hr":
        clearP(`${i}-p`);
        children.push(<hr key={`${i}-hr`} className="w-[30%] mx-auto my-4" />);
        break;
      case "em":
        currentP.push(<em key={i}>{node.text}</em>);
        break;
      case "hold":
        currentP.push(
          <HoldRef key={i} id={node.id} holdsState={holdsState}>
            {node.text}
          </HoldRef>,
        );
        break;
      default:
        throw new Error("Unknown node type: " + node.type);
    }
  }
  clearP(notes.length);

  return (
    <div className={classNames("flex flex-col gap-3", className)}>
      {children}
    </div>
  );
}

function HoldRef({ id, holdsState, children }) {
  return (
    <a
      className={classNames(
        "border-b-2 px-1 py-[1px] pt-[2px] transition-colors",
        holdsState.hoveredId === id
          ? "border-b-slate-400 bg-slate-500"
          : "border-b-slate-500 bg-slate-700",
      )}
      onMouseEnter={() => holdsState.onFocus(id)}
      onMouseLeave={() => holdsState.onBlur()}
      onFocus={() => holdsState.onFocus(id)}
      onBlur={() => holdsState.onBlur()}
      href="#"
      onClick={(e) => e.preventDefault()}
    >
      {children}
    </a>
  );
}

export default Route;
