import { useRouter } from "./router";
import { useStore } from "./store/context";

import Edit from "./pages/edit";
import Gallery from "./pages/gallery";
import Route from "./pages/route";

const ROUTE_BY_ID = /^\/routes\/([1-9][0-9]*)\/$/;
const ROUTE_BY_CATEGORY_INDEX = /^\/routes\/([^/]+)\/([1-9][0-9]*)\/$/;

function App() {
  const { path } = useRouter();
  if (!path.startsWith("/")) throw new Error("Missing leading slash: " + path);
  const { store } = useStore();

  if (path === "/") return <Gallery />;
  if (process.env.NODE_ENV === "development") {
    if (path === "/edit/") return <Edit />;
  }

  {
    const match = path.match(ROUTE_BY_ID);
    if (match != null) {
      const id = Number(match[1]);
      return <Route id={id} />;
    }
  }

  {
    const match = path.match(ROUTE_BY_CATEGORY_INDEX);
    if (match != null) {
      const category = match[1];
      const index = Number(match[2]);
      const routeId = store.resolveCategoryAndIndex(category, index);
      if (routeId == null)
        throw new Error(`No such route: ${category} #${index}`);
      return <Route id={routeId} />;
    }
  }

  throw new Error("Unknown path: " + path);
}

export default App;
