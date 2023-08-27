import fs from "fs";

import * as Server from "react-dom/server";

import App from "./app";

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    throw new Error(`usage: node server.js <path> <outfile>`);
  }
  const [path, outfile] = args;

  const rendered = Server.renderToString(<App path={path} />);
  const page = `\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<link rel="stylesheet" href="styles.css">
</head>
<body data-path="${escapeAttr(path)}">
<div id="root">${rendered}</div>
<script src="client.js"></script>
</body>
</html>
`;

  await fs.promises.writeFile(outfile, page);
}

function escapeAttr(text) {
  return text.replace(/[<>"'&]/g, (c) => `&#${c.charCodeAt(0)};`);
}

main();
