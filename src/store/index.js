export default class ClimbingDataStore {
  constructor() {
    this.routes = new Map();
    this.routeHeaders = new Map();
  }

  // `spec: {routes?: int[], routeHeaders?: int[]}`
  toSubset(spec) {
    const result = {};
    if (spec.routes != null)
      result.routes = spec.routes.map((k) => this.routes.get(k));
    if (spec.routeHeaders != null)
      result.routeHeaders = spec.routeHeaders.map((k) =>
        this.routeHeaders.get(k),
      );
    return result;
  }

  // `subset: {routes?: Route[], routeHeaders?: RouteHeader[]}`
  addData(data) {
    for (const header of data.routeHeaders || []) {
      this.routeHeaders.set(header.id, header);
    }
    for (const route of data.routes || []) {
      this.routes.set(route.id, route);
      const header = routeToHeader(route);
      this.routeHeaders.set(header.id, header);
    }
  }
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
