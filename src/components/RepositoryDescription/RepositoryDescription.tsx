import { selectGithubRepository } from '@/redux/store';
import { useAppSelector } from '@/hooks/redux';
import {
  Edge,
  selectIsFetchRepositoryPending,
} from '@/redux/slices/githubRepository.slice';
import { Chip, CircularProgress } from '@mui/material';
import { selectCurrentRepositoryId } from '@/redux/slices/table.slice';
import StarIcon from '@mui/icons-material/Star';
import styles from './RepositoryDescription.module.scss';

const RepositoryDescription: React.FC = () => {
  const { repository } = useAppSelector(selectGithubRepository);
  const currentRepositoryId = useAppSelector(selectCurrentRepositoryId);
  // После клика на строку в таблице RepositoriesTable ищем выбранный репозиторий
  const currentRepository = repository.find(
    (repo) => repo.id === currentRepositoryId,
  );
  const isLoading = useAppSelector(selectIsFetchRepositoryPending);

  if (isLoading) {
    return (
      <div className={styles['repository-description__container']}>
        <div className={styles['repository-description__placeholder']}>
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (!currentRepository) {
    return (
      <div className={styles['repository-description__container']}>
        <div className={styles['repository-description__placeholder']}>
          <h3>Выберите репозиторий</h3>
        </div>
      </div>
    );
  }

  console.log(
    currentRepository.repositoryTopics.edges.map(
      (edge: Edge) => edge.node.topic.name,
    ),
  );

  return (
    <div className={styles['repository-description__container']}>
      <div className={styles['repository-description__info']}>
        <h1 className={styles['repository-description__title']}>
          {currentRepository.name}
        </h1>
        <div className={styles['repository-description__header']}>
          {currentRepository.primaryLanguage && (
            <Chip
              className={styles['repository-description__chip']}
              label={currentRepository.primaryLanguage?.name ?? null}
              color="primary"
            />
          )}
          {currentRepository.stargazerCount > 0 && (
            <div className={styles['repository-description__stargazer-count']}>
              <StarIcon
                className={styles['repository-description__star-icon']}
                name="stargazer-count"
              />
              <span>{currentRepository.stargazerCount}</span>
            </div>
          )}
        </div>
        {currentRepository.repositoryTopics.edges.length > 0 && (
          <div className={styles['repository-description__repository-topics']}>
            {currentRepository.repositoryTopics.edges.map((edge: Edge) => (
              <Chip
                key={edge.node.topic.name}
                className={styles['repository-description__chip']}
                label={edge.node.topic.name}
              />
            ))}
          </div>
        )}
        <p className={styles['repository-description__full-desc']}>
          {currentRepository.description}
        </p>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={currentRepository.url}>
          {currentRepository.url}
        </a>
        <p>{currentRepository.licenseInfo?.name ?? 'Лицензия отсутствует'}</p>
      </div>
    </div>
  );
};

export default RepositoryDescription;
