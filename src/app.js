import Gallery from "./gallery";

const ROUTE_BY_ID = /^\/routes\/([1-9][0-9]*)\/$/;
const ROUTE_BY_CATEGORY_INDEX = /^\/routes\/([^/]+)\/([1-9][0-9]*)\/$/;

function App({ path }) {
  if (!path.startsWith("/")) throw new Error("Missing leading slash: " + path);

  if (path === "/") return <Gallery />;

  {
    const match = path.match(ROUTE_BY_ID);
    if (match != null) {
      const id = Number(match[1]);
      return <span>route #{id}</span>;
    }
  }

  {
    const match = path.match(ROUTE_BY_CATEGORY_INDEX);
    if (match != null) {
      const category = match[1];
      const index = Number(match[2]);
      return (
        <span>
          {category} #{index}
        </span>
      );
    }
  }

  throw new Error("Unknown path: " + path);
}

export default App;
