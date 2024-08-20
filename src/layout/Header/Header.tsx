import SearchBar from '@/components/SearchBar/SearchBar';
import styles from './Header.module.scss';

const Header: React.FC = () => {
  return (
    <div className={styles.header__container}>
      <header className={styles.header}>
        <SearchBar />
      </header>
    </div>
  );
};

export default Header;
