import { combineReducers, configureStore } from '@reduxjs/toolkit';
import githubReducer from '@/redux/slices/github.slice';
import githubRepositoryReducer from '@/redux/slices/githubRepository.slice';
import tableReducer from '@/redux/slices/table.slice';

const rootReducer = combineReducers({
  github: githubReducer,
  githubRepository: githubRepositoryReducer,
  table: tableReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export const selectGithub = (state: AppState) => state.github;
export const selectGithubRepository = (state: AppState) =>
  state.githubRepository;
export const selectTable = (state: AppState) => state.table;

export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
