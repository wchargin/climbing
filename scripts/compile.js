const fs = require("fs");

const esbuild = require("esbuild");

const data = require("../src/data.json");

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
    minify: env === "production",
  };

  const [server, client, storeLoader] = await Promise.all([
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
    esbuild.build({
      ...opts,
      entryPoints: ["src/store/loader.js"],
      platform: "browser",
      define: {
        ...opts.define,
        "process.env.CLIMBING_DATA_JSON_STRING": JSON.stringify(
          JSON.stringify(data),
        ),
      },
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
  await fs.promises.writeFile(
    "build/store-loader-meta.json",
    JSON.stringify(storeLoader.metafile),
  );
}

main();
