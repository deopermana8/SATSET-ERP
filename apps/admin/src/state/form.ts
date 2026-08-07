export type FormState = {
  editingId: string | null;
  dirty: boolean;
  autosaveEnabled: boolean;
};

export const defaultFormState: FormState = {
  editingId: null,
  dirty: false,
  autosaveEnabled: true,
};

export const formState = {
  defaultState: defaultFormState,
  actions: {
    startEdit(state: FormState, editingId: string | null): FormState {
      return { ...state, editingId, dirty: false };
    },
    markDirty(state: FormState, dirty: boolean): FormState {
      return { ...state, dirty };
    },
    setAutosave(state: FormState, autosaveEnabled: boolean): FormState {
      return { ...state, autosaveEnabled };
    },
  },
  selectors: {
    canSubmit(state: FormState): boolean {
      return state.editingId !== null || state.dirty;
    },
    isAutosaveEnabled(state: FormState): boolean {
      return state.autosaveEnabled;
    },
  },
  helper: {
    reset(): FormState {
      return { ...defaultFormState };
    },
  },
};
