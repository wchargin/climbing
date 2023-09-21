import Edit from "./pages/edit";
import Gallery from "./pages/gallery";
import Route from "./pages/route";

const ROUTE_BY_ID = /^\/routes\/([1-9][0-9]*)\/$/;
const ROUTE_BY_CATEGORY_INDEX = /^\/routes\/([^/]+)\/([1-9][0-9]*)\/$/;

export default function matchPath(path, store) {
  const match = matchPathInternal(path, store);
  if (match == null) return null;
  match.title = formatTitle(match.title);
  return match;
}

function formatTitle(baseTitle) {
  return `${baseTitle} | wchargin/climbing`;
}

function matchPathInternal(path, store) {
  if (!path.startsWith("/")) throw new Error("Missing leading slash: " + path);

  if (path === "/")
    return {
      title: "Completed routes",
      render: () => <Gallery />,
    };
  if (process.env.NODE_ENV === "development") {
    if (path === "/edit/")
      return {
        title: "Edit route",
        render: () => <Edit />,
      };
  }

  {
    const match = path.match(ROUTE_BY_ID);
    if (match != null) {
      const id = Number(match[1]);
      return {
        title: titleForRoute(id, store),
        render: () => <Route id={id} />,
      };
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
      return {
        title: titleForRoute(routeId, store),
        render: () => <Route id={routeId} />,
      };
    }
  }

  return null;
}

function titleForRoute(routeId, store) {
  const route = store.routes.get(routeId);
  if (route == null) throw new Error(`No route #${routeId}`);
  return `${capitalize(route.category)} #${route.indexInCategory}`;
}

function capitalize(s) {
  return s.replace(/\b./g, (c) => c.toUpperCase());
}
