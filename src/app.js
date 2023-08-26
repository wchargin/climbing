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

function Route({ route }) {
  const title = `${route.category.replace(/\b./g, (c) => c.toUpperCase())} #${
    route.indexInCategory
  }`;
  return (
    <figure className="flex flex-col p-2 gap-4 flex-grow justify-between bg-brand-700">
      <a href={imageUrl(route.id, "full")}>
        <img
          src={imageUrl(route.id, "400")}
          className="w-full"
          alt={`Photo of ${title}`}
        />
      </a>
      <figcaption className="text-center">
        #{route.id} ({title})
      </figcaption>
    </figure>
  );
}

function imageUrl(id, size) {
  const imageId = String(id).padStart(4, "0");
  return `https://storage.googleapis.com/wchargin-climbing-public/${size}/${imageId}.jpg`;
}

export default App;
