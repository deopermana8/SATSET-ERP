export type TableState = {
  entity: string;
  page: number;
  pageSize: number;
  search: string;
  selectedIds: string[];
};

export const defaultTableState: TableState = {
  entity: "destinasi",
  page: 1,
  pageSize: 10,
  search: "",
  selectedIds: [],
};

export const tableState = {
  defaultState: defaultTableState,
  actions: {
    setEntity(state: TableState, entity: string): TableState {
      return { ...state, entity, page: 1 };
    },
    setPage(state: TableState, page: number): TableState {
      return { ...state, page };
    },
    setSearch(state: TableState, search: string): TableState {
      return { ...state, search, page: 1 };
    },
    setSelectedIds(state: TableState, selectedIds: string[]): TableState {
      return { ...state, selectedIds };
    },
  },
  selectors: {
    paging(state: TableState): { page: number; pageSize: number } {
      return { page: state.page, pageSize: state.pageSize };
    },
    query(state: TableState): string {
      return state.search.trim().toLowerCase();
    },
  },
  helper: {
    hasSelection(state: TableState): boolean {
      return state.selectedIds.length > 0;
    },
  },
};
