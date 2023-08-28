export default class ClimbingDataStore {
  constructor() {
    this.routes = new Map();
    this.routeHeaders = new Map();
  }

  // `data: {routes?: Route[], routeHeaders?: RouteHeader[]}`
  static fromData(data) {
    const store = new ClimbingDataStore();
    for (const header of data.routeHeaders || []) {
      store.routeHeaders.set(header.id, header);
    }
    for (const route of data.routes || []) {
      store.routes.set(route.id, route);
      const header = routeToHeader(route);
      store.routeHeaders.set(header.id, header);
    }
    return store;
  }

  routeByCategoryAndIndex(category, index) {
    for (const route of this.routes.values()) {
      if (route.category === category && route.indexInCategory === index) {
        return route;
      }
    }
    return null;
  }
}

// `spec: {routes?: int[], routeHeaders?: int[]}`
export function toSubset(store, spec) {
  const result = {};
  if (spec.routes != null)
    result.routes = spec.routes.map((k) => store.routes.get(k));
  if (spec.routeHeaders != null)
    result.routeHeaders = spec.routeHeaders.map((k) =>
      store.routeHeaders.get(k),
    );
  return result;
}

function routeToHeader(route) {
  return {
    id: route.id,
    category: route.category,
    indexInCategory: route.indexInCategory,
    date: route.date,
    location: route.location,
    thumbhash: route.thumbhash,
  };
}
