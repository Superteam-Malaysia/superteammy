/** Wrap a CSV field so commas, quotes, and newlines survive the round trip. */
export function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function rowsToCsv(rows: string[][]): string {
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}
