import Header from './layout/Header/Header';
import SearchResults from './components/SearchResults/SearchResults';
import Footer from './layout/Footer/Footer';
import styles from './App.module.scss';

function App() {
  return (
    <div className={styles.container}>
      <Header />
      <SearchResults />
      <Footer />
    </div>
  );
}

export default App;
