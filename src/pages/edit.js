import { useState } from "react";

import classNames from "../classNames";
import { parse, unparse } from "../notesGrammar";

function Edit() {
  const [truth, setTruth] = useState({ type: "raw", raw: "" });

  function attempt(cb) {
    try {
      return { ok: true, value: cb() };
    } catch (e) {
      return { ok: false, value: String(e) };
    }
  }

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

  const textareaClasses = "bg-brand-900 w-full min-h-[40rem]";

  return (
    <main className="flex flex-col gap-3 m-4">
      <h1 className="text-2xl">Notes</h1>
      <div className="flex gap-3">
        <textarea
          value={raw.value}
          onChange={(e) => void setTruth({ type: "raw", raw: e.target.value })}
          className={classNames(textareaClasses, raw.ok || "text-red-500")}
        />
        <textarea
          value={parsed.value}
          onChange={(e) =>
            void setTruth({ type: "parsed", parsed: e.target.value })
          }
          className={classNames(textareaClasses, parsed.ok || "text-red-500")}
        />
      </div>
    </main>
  );
}

export default Edit;
