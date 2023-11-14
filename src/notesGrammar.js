// Grammar is a subset of CommonMark:
//
//    <notes> ::= <section> ( <horizontal-rule> <section> )*
//    <horizontal-rule> ::= "\n\n---\n\n"
//
//    <section> ::= <paragraph> ( <paragraph-break> <paragraph> )*
//    <paragraph-break> ::= "\n\n"
//
//    <paragraph> ::= <inline>+
//    <inline> ::= <literal> | <em> | <link>
//
//    <meta-escape> ::= "\"
//    <meta-em> ::= "*"
//    <meta-link-start> ::= "["
//    <meta-link-end> ::= "]"
//    <meta> ::= <meta-escape> | <meta-em> | <meta-link-start> | <meta-link-end>
//
//    <literal> ::= <character>+
//    <character> ::= ( <non-meta> | <meta-escape> <meta> )+
//    e.g., "someone said, '\[they\] got it!'" is a <literal>
//
//    <em> ::= <meta-em> <literal> <meta-em>
//    e.g.: "*really difficult*" is an <em>
//
//    <link> ::= <link-text> <link-ref>
//    <link-text> ::= <meta-link-start> <literal> <meta-link-end>
//    <link-ref> ::= <meta-link-start> <literal> <meta-link-end>
//    e.g.: "[the start hold][1]" is a <link>
//
// We use Markdown's reference links instead of inline links (i.e., "[foo][1]"
// instead of "[foo](1)") to avoid making parentheses metacharacters, so that
// we can have both of the following properties: (a) parentheses do not need to
// be escaped in literals, for ease of authoring; (b) metacharacters are always
// escaped (cannot appear bare in literals), for ease of lexing.
export { parse, unparse };

function parse(text) {
  text = text.trim();
  return intersperse(
    { type: "hr" },
    text.split("\n\n---\n\n").map((section) => {
      return intersperse(
        { type: "p" },
        section.split("\n\n").map((paragraph) => {
          return parseParagraph(paragraph);
        }),
      ).flat();
    }),
  ).flat();
}

const META_RE = /[\\*[\]]/g;

function* lexParagraph(paragraph) {
  while (paragraph.length > 0) {
    const metaIdx = paragraph.search(META_RE);
    if (metaIdx === -1) {
      yield { type: "lit", text: paragraph };
      return;
    }
    yield { type: "lit", text: paragraph.slice(0, metaIdx) };
    const meta = paragraph[metaIdx];
    paragraph = paragraph.slice(metaIdx + 1);
    switch (meta) {
      case "\\": {
        const next = paragraph[0];
        if (!next.match(META_RE)) throw new Error("Illegal escape sequence");
        yield { type: "lit", text: next };
        paragraph = paragraph.slice(1);
        break;
      }
      case "*":
        yield { type: "em" };
        break;
      case "[":
        yield { type: "linkStart" };
        break;
      case "]":
        yield { type: "linkEnd" };
        break;
      default:
        throw new Error("Unknown metacharacter: " + meta);
    }
  }
}

function* fuseLiterals(iter) {
  let parts = [];
  for (const token of iter) {
    if (token.type === "lit") {
      if (token.text.length > 0) parts.push(token.text);
    } else {
      if (parts.length > 0) {
        yield { type: "lit", text: parts.join("") };
        parts = [];
      }
      yield token;
    }
  }
  if (parts.length > 0) yield { type: "lit", text: parts.join("") };
}

function parseParagraph(paragraph) {
  const nodes = [];

  const tokens = fuseLiterals(lexParagraph(paragraph));
  const expect = (type, msgDone, msgInvalid) => {
    const elem = tokens.next();
    if (elem.done) throw new Error(msgDone);
    if (elem.value.type !== type) throw new Error(msgInvalid);
    return elem.value;
  };
  while (true) {
    let elem = tokens.next();
    if (elem.done) break;
    switch (elem.value.type) {
      case "lit":
        nodes.push(elem.value.text);
        break;
      case "em": {
        const lit = expect("lit", "em: unclosed", "em: want literal");
        nodes.push({ type: "em", text: lit.text });
        expect("em", "em: unclosed", "em: closed wrong");
        break;
      }
      case "linkStart": {
        const litText = expect("lit", "link: unclosed", "link: want literal");
        expect("linkEnd", "link: unclosed", "link: closed wrong");
        expect("linkStart", "link: missing hold spec", "link: bad hold spec");
        const litId = expect(
          "lit",
          "link: missing hold spec",
          "link: bad hold spec",
        );
        expect("linkEnd", "link: unclosed", "link: closed wrong");
        nodes.push({ type: "hold", id: litId.text, text: litText.text });
        break;
      }
    }
  }
  return nodes;
}

function intersperse(y, xs) {
  if (xs.length === 0) return [];
  const result = Array(xs.length * 2 - 1);
  let next = 0;
  result[next++] = xs[0];
  for (let i = 1; i < xs.length; i++) {
    result[next++] = y;
    result[next++] = xs[i];
  }
  return result;
}

function unparse(notes) {
  const parts = [];
  for (const node of notes) {
    if (typeof node === "string") {
      parts.push(escape(node));
      continue;
    }
    switch (node.type) {
      case "p":
        parts.push("\n\n");
        break;
      case "hr":
        parts.push("\n\n---\n\n");
        break;
      case "em":
        parts.push(`*${escape(node.text)}*`);
        break;
      case "hold":
        parts.push(`[${escape(node.text)}][${escape(node.id)}]`);
        break;
    }
  }
  return parts.join("");
}

function escape(text) {
  return text.replaceAll(META_RE, (c) => "\\" + c);
}
