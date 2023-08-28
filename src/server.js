import fs from "fs";
import pathLib from "path";

import * as Server from "react-dom/server";

import App from "./app";
import data from "./data";
import ClimbingDataStore from "./store";
import StoreContext from "./store/context";

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    throw new Error(`usage: node server.js <outdir>`);
  }
  const [outdir] = args;

  const fullStore = new ClimbingDataStore();
  fullStore.addData(data);

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
      const subset = fullStore.toSubset(storeSpec);
      const fsPath = pathLib.join(outdir, ...path.split("/"));
      return renderPage(path, subset, fsPath, "index.html");
    }),
  );
}

async function renderPage(path, storeSubset, outdir, filename) {
  console.warn("rendering %s -> %s/%s", path, outdir, filename);

  const store = new ClimbingDataStore();
  store.addData(storeSubset);
  const storeDataJson = JSON.stringify(storeSubset);

  const rendered = Server.renderToString(
    <StoreContext.Provider value={{ store, loaded: false }}>
      <App path={path} />
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

function pathToRoot(path) {
  if (!path.startsWith("/")) throw new Error("Missing leading slash: " + path);
  path = path.slice(1);
  return path.replace(/[^/]*\//g, "../").replace(/[^/]*$/, "");
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
