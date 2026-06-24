export function shuffle<T>(values: readonly T[]): T[] {
  const next = [...values];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const currentValue = next[index];
    const swapValue = next[swapIndex];

    if (currentValue === undefined || swapValue === undefined) {
      continue;
    }

    next[index] = swapValue;
    next[swapIndex] = currentValue;
  }

  return next;
}
