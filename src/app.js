import data from "./data.json";

function App() {
  const dataDesc = data.slice().reverse();
  return (
    <main>
      <h1>Routes climbed</h1>
      <div className="routes">
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
    <figure className="route">
      <a href={imageUrl(route.id, "full")}>
        <img src={imageUrl(route.id, "400")} alt={`Photo of ${title}`} />
      </a>
      <figcaption>
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
