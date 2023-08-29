export default function classNames(...xs) {
  return xs.filter((x) => typeof x == "string" && x.length > 0).join(" ");
}
