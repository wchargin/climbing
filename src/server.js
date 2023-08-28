import fs from "fs";
import pathLib from "path";

import * as Server from "react-dom/server";

import App from "./app";
import data from "./data";

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    throw new Error(`usage: node server.js <outdir>`);
  }
  const [outdir] = args;

  const paths = ["/"];
  for (const route of data.routes) {
    paths.push(`/routes/${route.id}/`);
    paths.push(`/routes/${route.category}/${route.indexInCategory}/`);
  }

  await Promise.all(
    paths.map((path) => {
      const fsPath = pathLib.join(outdir, ...path.split("/"));
      return renderPage(path, fsPath, "index.html");
    }),
  );
}

async function renderPage(path, outdir, filename) {
  console.warn("rendering %s -> %s/%s", path, outdir, filename);
  const rendered = Server.renderToString(<App path={path} />);
  const toRoot = pathToRoot(path);
  const page = `\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<link rel="stylesheet" href="${toRoot}styles.css">
<script src="${toRoot}client.js" async defer></script>
</head>
<body data-path="${escapeAttr(path)}">
<div id="root">${rendered}</div>
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

main();
