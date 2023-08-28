import { set } from "./global";

const dataRaw = process.env.CLIMBING_DATA_JSON_STRING;

set(JSON.parse(dataRaw));
