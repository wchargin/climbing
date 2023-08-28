import fs from "fs";
import pathLib from "path";

import * as Server from "react-dom/server";

import App from "./app";
import data from "./data";
import { pathToRoot } from "./path";
import Router from "./router";

import ClimbingDataStore, { toSubset } from "./store";
import StoreContext from "./store/context";

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    throw new Error(`usage: node server.js <outdir>`);
  }
  const [outdir] = args;

  const fullStore = ClimbingDataStore.fromData(data);

  const pages = [];
  pages.push({
    path: "/",
    storeSpec: { routeHeaders: data.routes.map((route) => route.id) },
  });
  for (const route of data.routes) {
    const storeSpec = { routes: [route.id] };
    pages.push({ path: `/routes/${route.id}/`, storeSpec });
    pages.push({
      path: `/routes/${route.category}/${route.indexInCategory}/`,
      storeSpec,
    });
  }

  await Promise.all(
    pages.map(({ path, storeSpec }) => {
      const subset = toSubset(fullStore, storeSpec);
      const fsPath = pathLib.join(outdir, ...path.split("/"));
      return renderPage(path, subset, fsPath, "index.html");
    }),
  );
}

async function renderPage(path, storeSubset, outdir, filename) {
  console.warn("rendering %s -> %s/%s", path, outdir, filename);

  const store = ClimbingDataStore.fromData(storeSubset);
  const storeDataJson = JSON.stringify(storeSubset);

  const rendered = Server.renderToString(
    <StoreContext.Provider value={{ store, loaded: false }}>
      <Router initialPath={path} gateway={null}>
        <App />
      </Router>
    </StoreContext.Provider>,
  );

  const toRoot = pathToRoot(path);
  const page = `\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<link rel="stylesheet" href="${toRoot}styles.css">
<script src="${toRoot}store-loader.js" async></script>
<script src="${toRoot}client.js" async defer></script>
</head>
<body data-path="${escapeAttr(path)}">
<div id="root">${rendered}</div>
<script type="application/json" id="store-data">\
${escapeJsonScript(storeDataJson)}\
</script>
</body>
</html>
`;

  await fs.promises.mkdir(outdir, { recursive: true });
  await fs.promises.writeFile(pathLib.join(outdir, filename), page);
}

function escapeAttr(text) {
  return text.replace(/[<>"'&]/g, (c) => `&#${c.charCodeAt(0)};`);
}

function escapeJsonScript(text) {
  // Avoid "</script>" literals inside JSON that goes in a <script> element.
  return text.replace(
    /[<>&]/g,
    (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}

main();
