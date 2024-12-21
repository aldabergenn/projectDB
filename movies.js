document.addEventListener('DOMContentLoaded', () => {


  const logoutBtn = document.querySelector('.btnLogout');

  logoutBtn.addEventListener('click', async () => {
    try {
      console.log("request logout")
      const response = await fetch('http://localhost:3000/logout', {
        method: 'POST',
        credentials: 'include',  
      });
      if (response.ok) {
        window.location.href = '/'; // Перенаправляем на страницу входа
      } else {
        alert('Ошибка при выходе из системы');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось выйти из системы');
    }
  });

  const moviesList = document.getElementById('moviesList');

  // Функция для загрузки фильмов
  async function loadMovies() {
    try {
      const userid = localStorage.getItem('userId')
      // const userId = await getUserId();  // Реализуйте эту функцию для получения user_id из сессии или локального хранилища

      // Отправляем запрос с user_id как query параметр
      const response = await fetch(`http://localhost:3000/movies?user_id=${userid}`, {
        credentials: 'include',  // Отправка cookies с запросом, если необходимо
      });
      const movies = await response.json();

      if (response.ok) {
        // Очистить список перед добавлением новых фильмов
        moviesList.innerHTML = '';

        // Перебираем фильмы и добавляем их в DOM
        movies.forEach((movie) => {
          const movieCard = document.createElement('div');
          movieCard.classList.add('movie-card');

          movieCard.innerHTML = `
            <img src="${movie.image_url}" alt="${movie.title}" />
            <h4>${movie.title}</h4>
            <p>${movie.description}</p>
            <span>Дата выпуска: ${new Date(movie.release_date).toLocaleDateString()}</span>
          `;

          moviesList.appendChild(movieCard);
        });
      } else {
        alert('Ошибка при загрузке фильмов');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось загрузить фильмы');
    }
  }

  // Загружаем фильмы при загрузке страницы
  loadMovies();

  // Логика для кнопки "Добавить фильм"
  const addMovieBtn = document.getElementById('addMovieBtn');
  const addMovieForm = document.getElementById('addMovieForm');
  const backBtn = document.getElementById('backBtn');

  addMovieBtn.addEventListener('click', () => {
    addMovieForm.style.display = 'block';
    backBtn.style.display = 'inline-block';
  });

  backBtn.addEventListener('click', () => {
    addMovieForm.style.display = 'none';
    backBtn.style.display = 'none';
  });

  // Логика для добавления нового фильма
  addMovieForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('movieTitle').value;
    const description = document.getElementById('movieDescription').value;
    const release_date = document.getElementById('movieReleaseDate').value;
    const image_url = document.getElementById('movieImageUrl').value;

    try {
      const user_id = localStorage.getItem('userId');
      const response = await fetch('http://localhost:3000/movie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          release_date,
          image_url,
          user_id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Фильм успешно добавлен');
        loadMovies();   
        addMovieForm.style.display = 'none';  
        backBtn.style.display = 'none';
      } else {
        alert('Ошибка при добавлении фильма');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось добавить фильм');
    }
  });
});