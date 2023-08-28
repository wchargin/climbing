import ClimbingDataStore from ".";
import { set } from "./global";

const dataRaw = process.env.CLIMBING_DATA_JSON_STRING;

function main() {
  const store = new ClimbingDataStore();
  store.addData(JSON.parse(dataRaw));
  set(store);
}

main();
