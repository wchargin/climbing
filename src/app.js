import data from "./data.json";

function App() {
  const dataDesc = data.slice().reverse();
  return (
    <main>
      <h1 className="text-4xl font-bold pt-8 pb-4 mx-2">Routes climbed</h1>
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
      className="flex flex-col flex-grow justify-between border border-brand-600 rounded-sm"
    >
      <figure
        className="relative border-4 rounded-sm"
        style={{ borderColor: categoryColor }}
      >
        <img
          src={imageUrl(route.id, "400")}
          alt={`Photo of ${title}`}
          className="w-full h-full object-contain flex items-center justify-evenly italic"
          style={{ aspectRatio: "3 / 4" }}
        />
        <figcaption className="absolute bottom-0 w-full p-2 text-center bg-black/25 backdrop-blur-sm">
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
