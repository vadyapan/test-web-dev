import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit/react';
import { GraphQLClient, gql } from 'graphql-request';
import { PrimaryLanguage } from './github.slice';

const GITHUB_GRAPHQL_API = import.meta.env.VITE_GITHUB_GRAPHQL_API;
const GITHUB_ACCESS_TOKEN = import.meta.env.VITE_GITHUB_ACCESS_TOKEN;

export interface DataRepository {
  node: NodeRepository;
}

export interface NodeRepository {
  id: string;
  name: string;
  description: string;
  url: string;
  stargazerCount: number;
  primaryLanguage: PrimaryLanguage;
  licenseInfo: LicenseInfo;
}

export interface LicenseInfo {
  name: string | null;
}

type InitialState = {
  repository: NodeRepository[];
  fetchRepositoryStatus: 'idle' | 'pending' | 'success' | 'failed';
};

export const fetchRepository = createAsyncThunk(
  'github/fetchRepository',
  async (id: string) => {
    const graphQLClient = new GraphQLClient(GITHUB_GRAPHQL_API, {
      headers: {
        Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      },
    });

    const queryString = gql`
        {
          node(id: "${id}") {
            ... on Repository {
              id
              name
              description
              url
              primaryLanguage {
                name
              }
              stargazerCount
              licenseInfo {
                name
                body
                url
              }
            } 
          }   
        }
      `;

    const variables = { id };
    const data: DataRepository = await graphQLClient.request(
      queryString,
      variables,
    );

    return data.node;
  },
);

const initialState: InitialState = {
  repository: [],
  fetchRepositoryStatus: 'idle',
};

const githubRepositorySlice = createSlice({
  name: 'githubRepository',
  initialState: initialState,
  selectors: {
    selectIsFetchRepositoryPending: (state) =>
      state.fetchRepositoryStatus === 'pending',
  },
  reducers: {
    resetRepository: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRepository.pending, (state) => {
        state.fetchRepositoryStatus = 'pending';
      })
      .addCase(
        fetchRepository.fulfilled,
        (state, action: PayloadAction<NodeRepository>) => {
          state.repository = [...state.repository, action.payload];
          state.fetchRepositoryStatus = 'success';
        },
      )
      .addCase(fetchRepository.rejected, (state) => {
        state.fetchRepositoryStatus = 'failed';
      });
  },
});

export const { selectIsFetchRepositoryPending } =
  githubRepositorySlice.selectors;
export const { resetRepository } = githubRepositorySlice.actions;

export default githubRepositorySlice.reducer;
