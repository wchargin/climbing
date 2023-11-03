let warnings = 0;
function warn(...fmt) {
  console.warn(...fmt);
  warnings++;
}

function main() {
  const data = require("../src/data.json");
  checkRouteIds(data.routes);
  checkRouteDates(data.routes);
  if (warnings > 0) {
    process.exitCode = Math.min(100, warnings);
  }
}

function checkRouteIds(routes) {
  if (routes.length === 0) return;
  let lastId = null;
  const lastIndexByCategory = new Map();

  for (const route of routes) {
    if (lastId != null && route.id !== lastId + 1) {
      warn(
        "route %s: non-sequential ID: %s after %s",
        route.id,
        route.id,
        lastId,
      );
    }
    const lastInCategory = lastIndexByCategory.get(route.category);
    if (
      lastInCategory != null &&
      route.indexInCategory !== lastInCategory + 1
    ) {
      warn(
        "route %s: non-sequential index in category %s: %s after %s",
        route.id,
        JSON.stringify(route.category),
        route.indexInCategory,
        lastInCategory,
      );
    }

    lastId = route.id;
    lastIndexByCategory.set(route.category, route.indexInCategory);
  }
}

function checkRouteDates(routes) {
  let lastDate = null;
  for (const route of routes) {
    // Dates are ISO-formatted, so logical order is lexical order.
    if (lastDate != null && route.date < lastDate) {
      warn(
        "route %s: date %s is before last date %s",
        route.id,
        route.date,
        lastDate,
      );
    }
    lastDate = route.date;
  }
}

main();
