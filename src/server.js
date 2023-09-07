import fs from "fs";
import pathLib from "path";

import * as Server from "react-dom/server";

import App from "./app";
import data from "./data";
import { pathToRoot } from "./path";
import Router from "./router";
import { ThumbhashCacheProvider } from "./thumbhash";

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
    storeSpec: {
      seasons: true,
      routeHeaders: data.routes.map((route) => route.id),
    },
  });
  for (const route of data.routes) {
    const neededHeaders = [];
    const storeSpec = {
      routes: [route.id],
      routeHeaders: [
        route.id - 1,
        route.id + 1,
        fullStore.resolveCategoryAndIndex(
          route.category,
          route.indexInCategory - 1,
        ),
        fullStore.resolveCategoryAndIndex(
          route.category,
          route.indexInCategory + 1,
        ),
      ].filter((x) => x != null && fullStore.routeHeaders.has(x)),
    };
    pages.push({ path: `/routes/${route.id}/`, storeSpec });
    pages.push({
      path: `/routes/${route.category}/${route.indexInCategory}/`,
      storeSpec,
    });
  }
  if (process.env.NODE_ENV === "development") {
    pages.push({
      path: "/edit/",
      storeSpec: {},
    });
  }

  await Promise.all(
    pages.map(({ path, storeSpec }) => {
      const subset = toSubset(fullStore, storeSpec);
      const fsPath = pathLib.join(outdir, ...path.split("/"));
      return renderPage(path, subset, fsPath, "index.html");
    }),
  );
  console.log("rendered %s pages to %s", pages.length, outdir);
}

async function renderPage(path, storeSubset, outdir, filename) {
  const store = ClimbingDataStore.fromData(storeSubset);
  const storeDataJson = JSON.stringify(storeSubset);

  const rendered = Server.renderToString(
    <StoreContext.Provider value={{ store, loaded: false }}>
      <ThumbhashCacheProvider>
        <Router initialPath={path} gateway={null}>
          <App />
        </Router>
      </ThumbhashCacheProvider>
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
<style>.js-opacity-0{opacity:0;}</style>
<noscript><style>.js-opacity-0{opacity:unset;}.nojs-hidden{display:none;}</style></noscript>
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
