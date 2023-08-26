const fs = require("fs");

const esbuild = require("esbuild");

async function main() {
  const env = process.env.NODE_ENV ?? "production";
  const result = await esbuild.build({
    entryPoints: ["src/server.js", "src/client.js"],
    bundle: true,
    outdir: "build",
    loader: { ".js": "jsx" },
    jsx: "automatic",
    metafile: true,
    define: {
      "process.env.NODE_ENV": JSON.stringify(env),
    },
    minify: true,
  });
  await fs.promises.writeFile(
    "build/meta.json",
    JSON.stringify(result.metafile),
  );
}

main();
