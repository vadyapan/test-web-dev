import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { selectGithub } from '@/redux/store';
import {
  fetchRepositories,
  resetRepositories,
  updateSearchQuery,
} from '@/redux/slices/github.slice';
import { resetRepository } from '@/redux/slices/githubRepository.slice';
import { InputBase, Paper } from '@mui/material';
import Button from '@mui/material/Button';
import styles from './SearchBar.module.scss';

const SearchBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchQuery, count, endCursor } = useAppSelector(selectGithub);
  const [previousSearchQuery, setPreviousSearchQuery] = useState('');

  // Обновляем searchQuery при вводе поискового запроса, если запрос изменился делаем сброс
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = e.target.value;

    if (newSearchQuery !== previousSearchQuery) {
      dispatch(resetRepositories());
      dispatch(resetRepository());
    }

    dispatch(updateSearchQuery(newSearchQuery));
  };

  // При клике проверяем, если поисковый запрос не изменился, то не делаем запрос, иначе пробуем делать запрос
  const handleSearchQueryСlick = () => {
    if (searchQuery === previousSearchQuery) {
      return;
    }

    try {
      dispatch(
        fetchRepositories({
          query: searchQuery,
          count,
          afterCursor: endCursor,
        }),
      );
      setPreviousSearchQuery(searchQuery);
    } catch (error) {
      if (error instanceof Error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <Paper className={styles['search-bar__paper']} component="form">
        <InputBase
          className={styles['search-bar__input']}
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Введите поисковый запрос"
          inputProps={{ 'aria-label': 'Введите поисковый запрос' }}
        />
      </Paper>
      <Button
        className={styles['search-bar__button']}
        variant="contained"
        size="large"
        onClick={handleSearchQueryСlick}>
        Искать
      </Button>
    </>
  );
};

export default SearchBar;
