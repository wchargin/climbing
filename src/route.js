import { Fragment } from "react";

import { imageUrl } from "./img";

import { useStore } from "./store/context";

function Route({ id }) {
  const { store } = useStore();
  const route = store.routes.get(id);
  if (route == null) throw new Error("No such route: " + id);
  return (
    <main>
      <img
        src={imageUrl(route.id, "1200")}
        style={{ width: 100, aspectRatio: "3 / 4" }}
      />
      <p>
        #{route.id} ({route.category} #{route.indexInCategory})
      </p>
      <Notes notes={route.notes} />
    </main>
  );
}

function Notes({ notes }) {
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
    <div>
      {paragraphs.map((children, i) => (
        <p key={i}>{children}</p>
      ))}
    </div>
  );
}

export default Route;
