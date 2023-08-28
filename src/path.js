export function pathToRoot(path) {
  if (!path.startsWith("/")) throw new Error("Missing leading slash: " + path);
  path = path.slice(1);
  return path.replace(/[^/]*\//g, "../").replace(/[^/]*$/, "");
}
