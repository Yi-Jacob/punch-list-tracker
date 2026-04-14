const VALID_TRANSITIONS: Record<string, string[]> = {
  open: ["in_progress"],
  in_progress: ["complete"],
  complete: [],
};

export const VALID_STATUSES = ["open", "in_progress", "complete"] as const;
export const VALID_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getTransitionError(from: string, to: string): string {
  if (from === to) {
    return `Item is already "${from}"`;
  }
  if (from === "complete") {
    return "Completed items cannot change status";
  }
  if (from === "open" && to === "complete") {
    return 'Items must move to "in_progress" before "complete"';
  }
  return `Cannot transition from "${from}" to "${to}"`;
}
