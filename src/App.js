import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Импортируем стили

const App = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Стейт для авторизации
  const [username, setUsername] = useState(''); // Стейт для хранения имени пользователя
  const [password, setPassword] = useState(''); // Стейт для хранения пароля
  const [isRegister, setIsRegister] = useState(false); // Стейт для режима регистрации

  // Получаем список жанров
  useEffect(() => {
    axios
      .get('https://api.jikan.moe/v4/genres/anime')
      .then((response) => {
        setGenres(response.data.data);
      })
      .catch((error) => {
        console.error('Ошибка при получении жанров:', error);
        setError('Ошибка при загрузке жанров');
      });
  }, []);

  // Функция для получения аниме по жанру, году и странице
  const fetchAnimeByGenreAndYear = (genreId, year, page) => {
    setLoading(true);
    setError(null);
    setAnimeList([]);

    const startDate = year ? `${year}-01-01` : '';
    const endDate = year ? `${year}-12-31` : '';

    axios
      .get(
        `https://api.jikan.moe/v4/anime?genres=${genreId}&start_date=${startDate}&end_date=${endDate}&limit=20&page=${page}&type=tv`
      )
      .then((response) => {
        setAnimeList(response.data.data);
        setTotalPages(response.data.pagination.last_visible_page);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка при получении аниме:', error);
        setError('Ошибка при загрузке аниме');
        setLoading(false);
      });
  };

  // Функция для поиска по названию аниме
  const searchAnime = (query, page) => {
    setLoading(true);
    setError(null);
    setAnimeList([]);

    axios
      .get(`https://api.jikan.moe/v4/anime?q=${query}&limit=20&page=${page}&type=tv`)
      .then((response) => {
        setAnimeList(response.data.data);
        setTotalPages(response.data.pagination.last_visible_page);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка при поиске аниме:', error);
        setError('Ошибка при поиске аниме');
        setLoading(false);
      });
  };

  // Обработчики изменения жанра, года и поискового запроса
  const handleGenreChange = (event) => {
    const genreId = event.target.value;
    setSelectedGenre(genreId);
    setCurrentPage(1);
    if (genreId) {
      fetchAnimeByGenreAndYear(genreId, selectedYear, 1);
    } else {
      setAnimeList([]);
    }
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    setCurrentPage(1);
    if (selectedGenre) {
      fetchAnimeByGenreAndYear(selectedGenre, year, 1);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    if (searchQuery) {
      searchAnime(searchQuery, 1);
    }
  };

  // Переходы между страницами
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      if (searchQuery) {
        searchAnime(searchQuery, nextPage);
      } else {
        fetchAnimeByGenreAndYear(selectedGenre, selectedYear, nextPage);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      if (searchQuery) {
        searchAnime(searchQuery, prevPage);
      } else {
        fetchAnimeByGenreAndYear(selectedGenre, selectedYear, prevPage);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Обработка входа в аккаунт
  const handleLogin = (event) => {
    event.preventDefault();
    // Пример обработки входа (сюда нужно будет добавить API для логина)
    if (username === 'user' && password === 'password') {
      setIsLoggedIn(true);
    } else {
      setError('Неверные имя пользователя или пароль');
    }
  };

  // Обработка регистрации
  const handleRegister = (event) => {
    event.preventDefault();
    // Пример обработки регистрации (сюда нужно будет добавить API для регистрации)
    if (username && password) {
      setIsLoggedIn(true);
      setIsRegister(false); // После регистрации возвращаем в режим входа
    } else {
      setError('Пожалуйста, введите имя пользователя и пароль');
    }
  };

  // Форма для входа или регистрации
  const renderAuthForm = () => (
    <form onSubmit={isRegister ? handleRegister : handleLogin} className="auth-form">
      <h2>{isRegister ? 'Регистрация' : 'Вход'}</h2>
      {error && <p className="error">{error}</p>}
      <div>
        <label>Имя пользователя:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Пароль:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="auth-btn">
        {isRegister ? 'Зарегистрироваться' : 'Войти'}
      </button>
      <p>
        {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          className="toggle-btn"
        >
          {isRegister ? 'Войти' : 'Создать аккаунт'}
        </button>
      </p>
    </form>
  );

  return (
    <div className="app">
      <h1 className="title">Поиск аниме</h1>

      {/* Если пользователь не авторизован, показываем форму входа/регистрации */}
      {!isLoggedIn ? (
        renderAuthForm()
      ) : (
        <>
          {/* Фильтры */}
          <div className="filters">
            <div className="filter-item">
              <label>Жанр:</label>
              <select value={selectedGenre} onChange={handleGenreChange} className="filter-select">
                <option value="">Выберите жанр</option>
                {genres.map((genre) => (
                  <option key={genre.mal_id} value={genre.mal_id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Год выхода:</label>
              <select value={selectedYear} onChange={handleYearChange} className="filter-select">
                <option value="">Выберите год</option>
                {Array.from({ length: 30 }, (_, i) => 2024 - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Поле для поиска */}
            <div className="filter-item">
              <form onSubmit={handleSearchSubmit}>
                <label>Поиск аниме:</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Введите название аниме"
                  className="filter-input"
                />
                <button type="submit" className="search-btn">Поиск</button>
              </form>
            </div>
          </div>

          {/* Загрузка и ошибки */}
          {loading && <p>Загрузка...</p>}
          {error && <p className="error">{error}</p>}

          {/* Список аниме */}
          <div className="anime-list">
            {animeList.length > 0 ? (
              <>
                <ul className="anime-cards">
                  {animeList.map((anime) => (
                    <li key={anime.mal_id} className="anime-card">
                      <a href={anime.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={anime.images.jpg.image_url}
                          alt={anime.title}
                          className="anime-image"
                        />
                      </a>
                      <p className="anime-title">
                        {anime.title_english ? anime.title_english : anime.title}
                      </p>
                      {anime.score && (
                        <p className="anime-rating">Рейтинг: {anime.score}</p>
                      )}
                    </li>
                  ))}
                </ul>

                {/* Кнопки пагинации */}
                <div className="pagination">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    Назад
                  </button>
                  <span>Страница {currentPage} из {totalPages}</span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Вперед
                  </button>
                </div>
              </>
            ) : (
              !loading && <p className="empty-list">Введите запрос для поиска или выберите жанр и год</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
