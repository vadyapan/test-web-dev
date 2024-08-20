import { selectGithub } from '@/redux/store';
import { useAppSelector } from '@/hooks/redux';
import RepositoryDescription from '../RepositoryDescription/RepositoryDescription';
import RepositoriesTable from '../RepositoriesTable/RepositoriesTable';
import styles from './SearchResults.module.scss';

const SearchResults: React.FC = () => {
  // Выбираем слайс github, извлекаем репозитории
  const { repositories } = useAppSelector(selectGithub);

  // Если репозиториев нет или не найдено совпадений, то показываем приветствие
  if (repositories.length === 0) {
    return (
      <h1 className={styles['search-results__welcome']}>Добро пожаловать</h1>
    );
  }

  // Иначе показываем таблицу и описание репозитория
  return (
    <div className={styles['search-results__container']}>
      <main className={styles['search-results__main']}>
        <div className={styles['search-results__content']}>
          <h1 className={styles['search-results__title']}>Результаты поиска</h1>
          <RepositoriesTable />
        </div>
        <RepositoryDescription />
      </main>
    </div>
  );
};

export default SearchResults;
