import Gallery from "./gallery";
import Route from "./route";
import { useRouter } from "./router";

import { useStore } from "./store/context";

const ROUTE_BY_ID = /^\/routes\/([1-9][0-9]*)\/$/;
const ROUTE_BY_CATEGORY_INDEX = /^\/routes\/([^/]+)\/([1-9][0-9]*)\/$/;

function App() {
  const { path } = useRouter();
  if (!path.startsWith("/")) throw new Error("Missing leading slash: " + path);
  const { store } = useStore();

  if (path === "/") return <Gallery />;

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
      const route = store.routeByCategoryAndIndex(category, index);
      if (route == null)
        throw new Error(`No such route: ${category} #${index}`);
      return <Route id={route.id} />;
    }
  }

  throw new Error("Unknown path: " + path);
}

export default App;
