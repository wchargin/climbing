import { useState } from "react";

import classNames from "../classNames";
import { parse, unparse } from "../notesGrammar";

function attempt(cb) {
  try {
    return { ok: true, value: cb() };
  } catch (e) {
    return { ok: false, value: String(e) };
  }
}

function useNotesState() {
  const [truth, setTruth] = useState({ type: "raw", raw: "" });

  let raw, parsed;
  switch (truth.type) {
    case "raw": {
      raw = { ok: true, value: truth.raw };
      parsed = attempt(() => parse(truth.raw));
      if (parsed.ok) parsed.value = JSON.stringify(parsed.value, null, 2);
      break;
    }
    case "parsed": {
      parsed = { ok: true, value: truth.parsed };
      raw = attempt(() => unparse(JSON.parse(truth.parsed)));
      break;
    }
    default:
      throw new Error(truth.type);
  }

  const setRaw = (raw) => setTruth({ type: "raw", raw });
  const setParsed = (parsed) => setTruth({ type: "parsed", parsed });

  return { raw, parsed, setRaw, setParsed };
}

function Cell({ label, children }) {
  return (
    <label className="flex flex-col">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

function isPositiveIntStr(str) {
  const num = Number(str);
  return String(num) === str && Number.isInteger(num) && num > 0;
}
const DATE_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;

function Edit() {
  const [headers, setHeaders] = useState({
    id: "",
    category: "black",
    indexInCategory: "",
    date: "",
    location: "poplar",
    thumbhash: "",
  });
  const notes = useNotesState();
  let notesOutput = [];
  if (notes.parsed.ok) {
    try {
      notesOutput = JSON.parse(notes.parsed.value);
    } catch (e) {}
  }
  const output = JSON.stringify(
    {
      ...headers,
      id: Number(headers.id),
      indexInCategory: Number(headers.indexInCategory),
      notes:
        notes.raw.ok && notes.parsed.ok ? JSON.parse(notes.parsed.value) : [],
    },
    null,
    2,
  );

  const setHeader = (key) => (e) =>
    setHeaders((h) => ({ ...h, [key]: e.target.value }));

  const clsInput = "bg-brand-900 text-sm py-px px-1 h-6";
  const clsSelect = classNames(clsInput, "focus-within:ring-2");
  const clsNotesTextarea = classNames(clsInput, "w-full min-h-[36rem]");
  const clsInvalid = "!bg-red-900";

  return (
    <main className="flex flex-col gap-3 m-4">
      <h1 className="text-2xl">Edit route</h1>
      <div className="flex gap-3">
        <Cell label="id">
          <input
            type="text"
            value={headers.id}
            onChange={setHeader("id")}
            className={classNames(
              clsInput,
              isPositiveIntStr(headers.id) || clsInvalid,
            )}
            size={3}
          />
        </Cell>
        <Cell label="category">
          <select
            value={headers.category}
            onChange={setHeader("category")}
            className={clsSelect}
          >
            <option>black</option>
            <option>blue</option>
            <option>pink</option>
          </select>
        </Cell>
        <Cell label="index">
          <input
            type="text"
            value={headers.indexInCategory}
            onChange={setHeader("indexInCategory")}
            className={classNames(
              clsInput,
              isPositiveIntStr(headers.indexInCategory) || clsInvalid,
            )}
            size={3}
          />
        </Cell>
        <Cell label="date">
          <input
            type="text"
            value={headers.date}
            onChange={setHeader("date")}
            className={classNames(
              clsInput,
              headers.date.match(DATE_RE) || clsInvalid,
            )}
            size={8}
          />
        </Cell>
        <Cell label="location">
          <select
            value={headers.location}
            onChange={setHeader("location")}
            className={clsSelect}
          >
            <option>poplar</option>
            <option>fremont</option>
          </select>
        </Cell>
        <Cell label="thumbhash">
          <input
            type="text"
            value={headers.thumbhash}
            onChange={setHeader("thumbhash")}
            className={classNames(clsInput, "font-mono text-sm")}
            size={12}
          />
        </Cell>
      </div>
      <div className="flex gap-3">
        <textarea
          value={notes.raw.value}
          onChange={(e) => notes.setRaw(e.target.value)}
          className={classNames(
            clsNotesTextarea,
            notes.raw.ok || "text-red-500",
          )}
        />
        <textarea
          value={notes.parsed.value}
          onChange={(e) => notes.setParsed(e.target.value)}
          className={classNames(
            clsNotesTextarea,
            notes.parsed.ok || "text-red-500",
          )}
        />
      </div>
      <textarea
        readOnly
        value={output}
        className={classNames(clsInput, "h-[12rem]")}
      />
    </main>
  );
}

export default Edit;
