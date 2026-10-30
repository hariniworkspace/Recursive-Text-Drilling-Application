function normalizeDelimiter(delimiter) {
  if (
    delimiter === "newline" ||
    delimiter === "\n"
  ) {
    return "\n";
  }

  if (
    delimiter === "space" ||
    delimiter === " "
  ) {
    return " ";
  }

  if (
    delimiter === "character" ||
    delimiter === ""
  ) {
    return null;
  }

  return delimiter;
}


/*
 * Split text according to delimiter.
 */
function splitText(text, delimiter) {
  const value = String(text ?? "");

  if (value.length === 0) {
    return [];
  }

  const normalized =
    normalizeDelimiter(delimiter);

  /*
   * Character drilling
   */
  if (normalized === null) {
    return Array.from(value);
  }

  return value.split(normalized);
}


/*
 * ==========================================
 * LINE DRILLING
 * ==========================================
 */
export function drillParagraph(
  paragraph,
  delimiter = "newline"
) {
  const lines = splitText(
    paragraph,
    delimiter
  );

  return lines.map(
    (line, index) => ({
      id: `line-${index}`,
      type: "line",
      value: line,
      index,
      children: []
    })
  );
}


/*
 * ==========================================
 * WORD DRILLING
 * ==========================================
 *
 * Input:
 * "Hello world"
 *
 * Output:
 *
 * Hello
 * world
 */
export function drillWords(
  line
) {
  const words = splitText(
    line,
    "space"
  );

  return words
    .filter(
      (word) => word.length > 0
    )
    .map(
      (word, index) => ({
        id: `word-${index}`,
        type: "word",
        value: word,
        index,
        children: []
      })
    );
}


/*
 * ==========================================
 * CHARACTER DRILLING
 * ==========================================
 *
 * Input:
 * "Hello"
 *
 * Output:
 *
 * H
 * e
 * l
 * l
 * o
 */
export function drillCharacters(
  word
) {
  return Array.from(
    String(word ?? "")
  ).map(
    (character, index) => ({
      id: `character-${index}`,
      type: "character",
      value: character,
      index,
      children: []
    })
  );
}


/*
 * ==========================================
 * GENERIC NODE DRILLING
 * ==========================================
 *
 * Used by the backend API.
 */
export function drillNode(
  value,
  level
) {
  if (level === "word") {
    return drillWords(value);
  }

  if (level === "character") {
    return drillCharacters(value);
  }

  return [];
}


/*
 * ==========================================
 * REBUILD PARAGRAPH
 * ==========================================
 */
export function rebuildParagraph(
  nodes,
  delimiter = "newline"
) {
  const separator =
    normalizeDelimiter(
      delimiter
    );

  if (separator === null) {
    return nodes
      .map(
        (node) => node.value
      )
      .join("");
  }

  return nodes
    .map(
      (node) => node.value
    )
    .join(separator);
}