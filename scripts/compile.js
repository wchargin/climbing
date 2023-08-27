const fs = require("fs");

const esbuild = require("esbuild");

async function main() {
  const env = process.env.NODE_ENV ?? "production";

  // Options common to server and client bundles.
  const opts = {
    bundle: true,
    outdir: "build",
    loader: { ".js": "jsx" },
    jsx: "automatic",
    metafile: true,
    define: {
      "process.env.NODE_ENV": JSON.stringify(env),
    },
    minify: true,
  };

  const [server, client] = await Promise.all([
    esbuild.build({
      ...opts,
      entryPoints: ["src/server.js"],
      platform: "node",
    }),
    esbuild.build({
      ...opts,
      entryPoints: ["src/client.js"],
      platform: "browser",
    }),
  ]);

  await fs.promises.writeFile(
    "build/server-meta.json",
    JSON.stringify(server.metafile),
  );
  await fs.promises.writeFile(
    "build/client-meta.json",
    JSON.stringify(client.metafile),
  );
}

main();
