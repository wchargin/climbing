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

function Edit() {
  const notes = useNotesState();

  const textareaClasses = "bg-brand-900 w-full min-h-[40rem]";

  return (
    <main className="flex flex-col gap-3 m-4">
      <h1 className="text-2xl">Notes</h1>
      <div className="flex gap-3">
        <textarea
          value={notes.raw.value}
          onChange={(e) => notes.setRaw(e.target.value)}
          className={classNames(
            textareaClasses,
            notes.raw.ok || "text-red-500",
          )}
        />
        <textarea
          value={notes.parsed.value}
          onChange={(e) => notes.setParsed(e.target.value)}
          className={classNames(
            textareaClasses,
            notes.parsed.ok || "text-red-500",
          )}
        />
      </div>
    </main>
  );
}

export default Edit;
