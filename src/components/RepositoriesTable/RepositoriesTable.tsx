import {
  selectGithub,
  selectGithubRepository,
  selectTable,
} from '@/redux/store';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  changeSort,
  fetchRepositories,
  PrimaryLanguage,
  selectIsFetchRepositoriesPending,
  sortRepositories,
} from '@/redux/slices/github.slice';
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridRowParams,
  GridSortModel,
  GridPaginationModel,
} from '@mui/x-data-grid';
import {
  changePagination,
  changeCurrentRepositoryId,
} from '@/redux/slices/table.slice';
import { fetchRepository } from '@/redux/slices/githubRepository.slice';
import { useEffect, useState } from 'react';
import styles from './RepositoriesTable.module.scss';

// Настраиваем столбцы
const columns: GridColDef[] = [
  { field: 'name', headerName: 'Название', type: 'string', width: 180 },
  {
    field: 'primaryLanguage',
    headerName: 'Язык',
    type: 'string',
    width: 150,
    // Если поле пустое или не найдено - возвращаем пустую строку
    valueGetter: (params: PrimaryLanguage) => params?.name ?? '',
  },
  {
    field: 'forkCount',
    headerName: 'Число форков',
    type: 'number',
    headerAlign: 'left',
    align: 'left',
    width: 150,
  },
  {
    field: 'stargazerCount',
    headerName: 'Число звезд',
    type: 'number',
    headerAlign: 'left',
    align: 'left',
    width: 150,
  },
  {
    field: 'updatedAt',
    headerName: 'Дата обновления',
    type: 'date',
    width: 150,
    // Преобразование JSON date format в строку
    valueGetter: (params: Date) => new Date(params),
  },
];

const RepositoriesTable: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchQuery, count, endCursor, repositories, repositoryCount } =
    useAppSelector(selectGithub);
  const { repository } = useAppSelector(selectGithubRepository);
  const currentSort = useAppSelector(selectGithub);
  const pagination = useAppSelector(selectTable);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
  const rows: GridRowsProp = repositories.slice(
    pagination.page * pagination.pageSize,
    pagination.page * pagination.pageSize + pagination.pageSize,
  );
  const [sortModel, setSortModel] = useState(currentSort.sort);
  const isLoading = useAppSelector(selectIsFetchRepositoriesPending);

  // Делаем запрос при переходе на новую страницу
  useEffect(() => {
    dispatch(changePagination(paginationModel));

    if (
      paginationModel.page * paginationModel.pageSize >=
      repositories.length
    ) {
      try {
        dispatch(
          fetchRepositories({
            query: searchQuery,
            count: paginationModel.pageSize,
            afterCursor: endCursor,
          }),
        );
      } catch (error) {
        if (error instanceof Error) {
          console.log(error);
        }
      }
    }
  }, [dispatch, paginationModel, repositories, searchQuery, count, endCursor]);

  // Обрабатываем клик по строке таблицы, вытаскиваем id репозитория, если не найден запрашиваем данные
  const handleRowClick = (rowParams: GridRowParams) => {
    if (typeof rowParams.id === 'string') {
      if (!repository.some((repo) => repo.id === rowParams.id)) {
        dispatch(fetchRepository(rowParams.id));
      }

      dispatch(changeCurrentRepositoryId(rowParams.id));
    }
  };

  // При выборе сортировки обновляем состояние в компоненте, меняем состояние в сторе и сортируем репозитории
  const handleSortModelChange = (newSortModel: GridSortModel) => {
    setSortModel(newSortModel);

    dispatch(changeSort(newSortModel));
    dispatch(sortRepositories());
  };

  // При выборе пагинации обновляем состояние в компоненте
  const handlePaginationModelChange = (
    newPaginationModel: GridPaginationModel,
  ) => {
    setPaginationModel(newPaginationModel);
  };

  return (
    <div className={styles['repositories-table__container']}>
      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={repositoryCount}
        paginationModel={pagination}
        onPaginationModelChange={handlePaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        onRowClick={handleRowClick}
        pageSizeOptions={[5, 10, 25]}
        paginationMode="server"
        loading={isLoading}
        hideFooterSelectedRowCount
        disableColumnMenu
      />
    </div>
  );
};

export default RepositoriesTable;
