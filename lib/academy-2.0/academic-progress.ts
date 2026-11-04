export function levelForWU(totalWU: number): number {
  return totalWU >= 1250 ? 6 : totalWU >= 1000 ? 5 : totalWU >= 750 ? 4 : totalWU >= 500 ? 3 : totalWU >= 150 ? 2 : 1;
}
