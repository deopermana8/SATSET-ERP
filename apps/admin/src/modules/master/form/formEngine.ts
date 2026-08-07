import type { MasterFormState } from "../crud/types.js";

export function captureMasterDraft(state: MasterFormState, draft: Record<string, unknown>): MasterFormState {
  return {
    ...state,
    dirty: true,
    draft: { ...draft },
    undoStack: [...state.undoStack, { ...state.draft }],
    redoStack: [],
  };
}

export function restoreMasterDraft(state: MasterFormState): MasterFormState {
  const previous = state.undoStack[state.undoStack.length - 1];
  if (!previous) {
    return state;
  }
  return {
    ...state,
    dirty: true,
    draft: { ...previous },
    undoStack: state.undoStack.slice(0, -1),
    redoStack: [...state.redoStack, { ...state.draft }],
  };
}

export function redoMasterDraft(state: MasterFormState): MasterFormState {
  const next = state.redoStack[state.redoStack.length - 1];
  if (!next) {
    return state;
  }
  return {
    ...state,
    dirty: true,
    draft: { ...next },
    redoStack: state.redoStack.slice(0, -1),
    undoStack: [...state.undoStack, { ...state.draft }],
  };
}

export function resetMasterForm(): MasterFormState {
  return {
    editingId: null,
    dirty: false,
    autosaveEnabled: true,
    draft: {},
    undoStack: [],
    redoStack: [],
  };
}
