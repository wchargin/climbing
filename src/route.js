import { Fragment } from "react";

import FadingImage from "./fadingImage";
import { imageUrl } from "./img";
import { useRouter } from "./router";
import useThumbhash from "./thumbhash";

import { useStore } from "./store/context";

const LOCATION_NAMES = {
  poplar: "SBP Poplar",
  fremont: "SBP Fremont",
};

function Route({ id }) {
  const { store, loaded } = useStore();
  const { navigate, href } = useRouter();

  const route = store.routes.get(id);
  if (route == null) throw new Error("No such route: " + id);
  const thumbhash = useThumbhash(route.thumbhash);

  const categoryCaps = route.category.replace(/\b./g, (c) => c.toUpperCase());
  return (
    <main className="flex flex-col items-center md:grid md:grid-cols-2 md:gap-6 md:p-[2rem] md:h-screen">
      <div className="relative w-full h-full">
        <figure
          className="route-image-holder flex justify-center md:justify-end md:absolute md:right-0 md:top-0 md:bottom-0 md:h-full"
          style={{
            background:
              thumbhash.image != null
                ? "center / cover no-repeat"
                : thumbhash.averageColor,
            backgroundImage: thumbhash.image?.cssUrl,
          }}
        >
          <FadingImage
            className="object-contain md:object-right md:fixed md:top-0 md:bottom-0 md:h-screen md:max-w-[50vw]"
            src={imageUrl(route.id, "1200")}
            style={{ aspectRatio: "3 / 4" }}
          />
        </figure>
      </div>
      <div className="mt-12 w-full lg:max-w-[600px] px-6 lg:px-0">
        <h1 className="text-4xl mb-2 outline-l-4">
          {categoryCaps} #{route.indexInCategory}
        </h1>
        <h2 className="text-brand-300 mb-2">Route #{route.id}</h2>
        <h2 className="text-brand-300 mb-2">
          {route.date} &middot; {LOCATION_NAMES[route.location]}
        </h2>
        <Notes className="mb-6" notes={route.notes} />
        <p className="text-brand-300 mb-6">
          <a
            className="hover:underline focus:underline active:text-red-600"
            href={href("/")}
            onClick={
              !loaded
                ? undefined
                : (e) => {
                    e.preventDefault();
                    navigate("/");
                  }
            }
          >
            &laquo; Back to route gallery
          </a>
        </p>
      </div>
    </main>
  );
}

function Notes({ notes, className }) {
  const paragraphs = [];

  let currentP = [];
  for (let i = 0; i < notes.length; i++) {
    const node = notes[i];
    if (typeof node === "string") {
      currentP.push(<Fragment key={i}>{node}</Fragment>);
      continue;
    }
    switch (node.type) {
      case "p":
        paragraphs.push(currentP);
        currentP = [];
        break;
      case "em":
        currentP.push(<em key={i}>{node.text}</em>);
        break;
      default:
        throw new Error("Unknown node type: " + node.type);
    }
  }
  if (currentP.length > 0) paragraphs.push(currentP);

  return (
    <div className={className}>
      {paragraphs.map((children, i) => (
        <p key={i} className="mt-3">
          {children}
        </p>
      ))}
    </div>
  );
}

export default Route;
