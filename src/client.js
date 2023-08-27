import * as Client from "react-dom/client";

import App from "./app";

function main() {
  const root = document.getElementById("root");
  if (root == null) throw new Error("Couldn't find DOM node for React root");
  const path = document.body.dataset.path;
  if (path == null) throw new Error("No application path specified");
  const app = <App path={path} />;
  Client.hydrateRoot(root, app);
}

main();
