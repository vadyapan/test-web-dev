import { PayloadAction } from '@reduxjs/toolkit/react';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GridSortItem } from '@mui/x-data-grid/models/gridSortModel';
import { GraphQLClient, gql } from 'graphql-request';

const GITHUB_GRAPHQL_API = import.meta.env.VITE_GITHUB_GRAPHQL_API;
const GITHUB_ACCESS_TOKEN = import.meta.env.VITE_GITHUB_ACCESS_TOKEN;

// Описание ответа запроса
export interface DataRepositories {
  search: Search;
}

export interface Search {
  edges: Edge[];
  repositoryCount: number;
  pageInfo: pageInfo;
}

export interface pageInfo {
  endCursor: string;
  hasNextPage: boolean;
}

export interface Edge {
  node: Node;
}

export interface Node {
  id: string;
  name: string;
  primaryLanguage: PrimaryLanguage;
  forkCount: number;
  stargazerCount: number;
  updatedAt: Date;
}

export interface PrimaryLanguage {
  name: string;
}

// Описание для начального состояния
type InitialState = {
  searchQuery: string;
  repositories: Node[];
  sort: GridSortItem[];
  fetchRepositoriesStatus: 'idle' | 'pending' | 'success' | 'failed';
  count: number;
  repositoryCount: number;
  endCursor: string;
  hasNextPage: boolean;
};

// Функция сортирует repositories по столбцу в зависимости от типа сортировки, иначе вернем исходные данные
const applySort = (repositories: Node[], sort: GridSortItem[]) => {
  if (sort.length > 0) {
    const { field, sort: sortDirection } = sort[0];

    return [...repositories].sort((a, b) => {
      let valueA: string | number | Date | PrimaryLanguage;
      let valueB: string | number | Date | PrimaryLanguage;

      // Проверяем, есть ли в поле primaryLanguage данные name, если нет, то присваиваем пустую строку
      if (field === 'primaryLanguage') {
        valueA = a[field]?.name ?? '';
        valueB = b[field]?.name ?? '';
      } else {
        valueA = a[field as keyof Node];
        valueB = b[field as keyof Node];
      }

      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  return repositories;
};

// Для выполнения запроса создаем функцию fetchRepositories
export const fetchRepositories = createAsyncThunk(
  'github/fetchRepositories',
  async ({
    query,
    count,
    afterCursor,
  }: {
    query: string;
    count: number;
    afterCursor: string;
  }) => {
    // Инициализация GraphQLClient c помощью библиотеки graphql-request
    const graphQLClient = new GraphQLClient(GITHUB_GRAPHQL_API, {
      headers: {
        Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      },
    });

    // Запрос на получение данных
    const queryString = gql`
      {
        search(query: "${query}", type: REPOSITORY, first: ${count}, after: "${afterCursor}") {
          edges {
            node {
              ... on Repository {
                id
                name
                primaryLanguage {
                  name
                }
                forkCount
                stargazerCount
                updatedAt
              }
            }
          }
          repositoryCount
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `;

    // Выполнение запроса
    const variables = { query, count, afterCursor };
    const data: DataRepositories = await graphQLClient.request(
      queryString,
      variables,
    );

    // Возвращаем полученные данные
    return {
      nodes: data.search.edges.map((edge: Edge) => edge.node),
      searchQuery: query,
      repositoryCount: data.search.repositoryCount,
      endCursor: data.search.pageInfo.endCursor,
      hasNextPage: data.search.pageInfo.hasNextPage,
    };
  },
);

// Описание начального состояния
const initialState: InitialState = {
  searchQuery: '',
  repositories: [],
  sort: [],
  fetchRepositoriesStatus: 'idle',
  repositoryCount: 0,
  count: 5,
  endCursor: '',
  hasNextPage: true,
};

// Создаем слайс
const githubSlice = createSlice({
  name: 'github',
  initialState: initialState,
  selectors: {
    selectIsFetchRepositoriesPending: (state) =>
      state.fetchRepositoriesStatus === 'pending',
  },
  reducers: {
    updateSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    sortRepositories: (state) => {
      state.repositories = applySort([...state.repositories], state.sort);
    },
    changeSort: (state, action: PayloadAction<GridSortItem[]>) => {
      state.sort = action.payload;
    },
    resetRepositories: () => {
      return initialState;
    },
  },
  // Для обработки выполнения запроса добавляем extraReducers
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepositories.pending, (state) => {
        state.fetchRepositoriesStatus = 'pending';
      })
      .addCase(
        fetchRepositories.fulfilled,
        (
          state,
          action: PayloadAction<{
            nodes: Node[];
            searchQuery: string;
            repositoryCount: number;
            endCursor: string;
            hasNextPage: boolean;
          }>,
        ) => {
          const repositories = applySort(
            [...state.repositories, ...action.payload.nodes],
            state.sort,
          );

          state.repositories = repositories;
          state.searchQuery = action.payload.searchQuery;
          state.repositoryCount = action.payload.repositoryCount;
          state.endCursor = action.payload.endCursor;
          state.hasNextPage = action.payload.hasNextPage;
          state.fetchRepositoriesStatus = 'success';
        },
      )
      .addCase(fetchRepositories.rejected, (state) => {
        state.fetchRepositoriesStatus = 'failed';
      });
  },
});

export const { selectIsFetchRepositoriesPending } = githubSlice.selectors;
export const {
  updateSearchQuery,
  sortRepositories,
  changeSort,
  resetRepositories,
} = githubSlice.actions;

export default githubSlice.reducer;
