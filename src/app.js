import data from "./data.json";

function App() {
  const dataDesc = data.slice().reverse();
  return (
    <main>
      <h1 className="text-xl font-bold pt-4">Routes climbed</h1>
      <div className="routes-grid grid gap-4 p-2">
        {dataDesc.map((route) => (
          <Route key={route.id} route={route} />
        ))}
      </div>
    </main>
  );
}

const CATEGORY_COLORS = {
  black: "#111111",
  blue: "#82a5d6",
  pink: "#f0b5ad",
};

function Route({ route }) {
  const title = `${route.category.replace(/\b./g, (c) => c.toUpperCase())} #${
    route.indexInCategory
  }`;
  const categoryColor = CATEGORY_COLORS[route.category] ?? null;
  return (
    <a
      href={imageUrl(route.id, "full")}
      className="flex flex-col flex-grow justify-between border border-1 border-brand-600 rounded-sm"
    >
      <figure>
        <div
          className="flex-grow rounded-t-sm border-4"
          style={{ borderColor: categoryColor }}
        >
          <img
            src={imageUrl(route.id, "400")}
            alt={`Photo of ${title}`}
            className="w-full h-full object-contain"
            style={{
              aspectRatio: "3 / 4",
            }}
          />
        </div>
        <figcaption className="py-2 text-center border-t border-brand-600">
          #{route.id} ({title})
        </figcaption>
      </figure>
    </a>
  );
}

function imageUrl(id, size) {
  const imageId = String(id).padStart(4, "0");
  return `https://storage.googleapis.com/wchargin-climbing-public/${size}/${imageId}.jpg`;
}

export default App;
