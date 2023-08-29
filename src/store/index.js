export default class ClimbingDataStore {
  constructor() {
    this.routes = new Map();
    this.routeHeaders = new Map();
    // Two-layered map from `category: string` to `indexInCategory: number` to
    // `routeId: number`. Populated with the domain of `routeHeaders`, which is
    // a superset of `routes`.
    this._categoryIndexLookup = new Map();
  }

  // `data: {routes?: Route[], routeHeaders?: RouteHeader[]}`
  static fromData(data) {
    const store = new ClimbingDataStore();
    for (const header of data.routeHeaders || []) {
      store.routeHeaders.set(header.id, header);
      addCategoryIndexMapping(store, header);
    }
    for (const route of data.routes || []) {
      store.routes.set(route.id, route);
      const header = routeToHeader(route);
      store.routeHeaders.set(header.id, header);
      addCategoryIndexMapping(store, header);
    }
    return store;
  }

  resolveCategoryAndIndex(category, indexInCategory) {
    const categoryLookup = this._categoryIndexLookup.get(category);
    if (categoryLookup == null) return null;
    return categoryLookup.get(indexInCategory) ?? null;
  }
}

function addCategoryIndexMapping(store, { category, indexInCategory, id }) {
  const rootLookup = store._categoryIndexLookup;
  let categoryLookup = rootLookup.get(category);
  if (categoryLookup == null) {
    rootLookup.set(category, (categoryLookup = new Map()));
  }
  categoryLookup.set(indexInCategory, id);
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
