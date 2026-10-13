/**
 * Excel-style Enter for editable grids: move to the same column on the next
 * line. Attach to the <table>; cells mark themselves with data-row/data-col.
 */
export function moveDownOnEnter(event) {
  if (event.key !== 'Enter') return;
  const { row, col } = event.target.dataset;
  if (row == null) return;

  event.preventDefault();
  const table = event.currentTarget;
  table.querySelector(`[data-row="${Number(row) + 1}"][data-col="${col}"]`)?.focus();
}
