import * as Server from "react-dom/server";

import App from "./app";

function main() {
  const rendered = Server.renderToString(<App />);
  const page = `\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<div id="root">${rendered}</div>
<script src="client.js"></script>
</body>
</html>
`;
  process.stdout.write(page);
}

main();
