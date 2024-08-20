import { createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit/react';

type InitialState = {
  currentRepositoryId: string | null;
  page: number;
  pageSize: number;
};

const initialState: InitialState = {
  currentRepositoryId: null,
  page: 0,
  pageSize: 5,
};

const tableSlice = createSlice({
  name: 'table',
  initialState: initialState,
  selectors: {
    selectCurrentRepositoryId: (state) => state.currentRepositoryId,
  },
  reducers: {
    changeCurrentRepositoryId: (state, action: PayloadAction<string>) => {
      state.currentRepositoryId = action.payload;
    },
    changePagination: (
      state,
      action: PayloadAction<{ page: number; pageSize: number }>,
    ) => {
      state.page = action.payload.page;
      state.pageSize = action.payload.pageSize;
    },
  },
});

export const { selectCurrentRepositoryId } = tableSlice.selectors;
export const { changeCurrentRepositoryId, changePagination } =
  tableSlice.actions;

export default tableSlice.reducer;
