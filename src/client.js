import * as Client from "react-dom/client";

import App from "./app";

function main() {
  const root = document.getElementById("root");
  if (root == null) throw new Error("Couldn't find DOM node for React root");
  const app = <App />;
  Client.hydrateRoot(root, app);
}

main();
