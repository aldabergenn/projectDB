const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');

// Открытие формы логина
btnPopup?.addEventListener('click', () => {
    wrapper?.classList.add('active-popup');
});

// Закрытие формы
iconClose?.addEventListener('click', () => {
    wrapper?.classList.remove('active-popup');
});

// Переход на регистрацию
registerLink?.addEventListener('click', () => {
    document.querySelector('.form-box.login')?.classList.remove('active');
    document.querySelector('.form-box.register')?.classList.add('active');
});

// Переход на логин
loginLink?.addEventListener('click', () => {
    document.querySelector('.form-box.register')?.classList.remove('active');
    document.querySelector('.form-box.login')?.classList.add('active');
});

// Инициализация начального состояния
document.querySelector('.form-box.login')?.classList.add('active');
// Обработка формы регистрации
const registerForm = document.querySelector('.form-box.register form');
registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = registerForm.querySelector('input[type="text"]').value;
    const email = registerForm.querySelector('input[type="email"]').value;
    const password = registerForm.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        alert('Ошибка регистрации, попробуйте снова.');
    }
});

// Обработка формы входа
const loginForm = document.querySelector('.form-box.login form');
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            // Сохраняем userId в localStorage после успешного входа
            localStorage.setItem('userId', result.userId); // предполагаем, что сервер возвращает userId
            alert(result.message);
            window.location.href = 'movies.html';
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        alert('Ошибка входа, попробуйте снова.');
    }
});

// Логика кнопки Logout
document.querySelector('.btnLogout')?.addEventListener('click', () => {
    console.log('Кнопка выхода нажата');
    // Очистка состояния
    localStorage.removeItem('authToken'); // Удалить токен из localStorage
    localStorage.removeItem('userId'); // Удалить userId из localStorage
    sessionStorage.clear(); // Очистить sessionStorage
    
    // Перенаправление на страницу входа
    window.location.href = 'index.html';
});

const movieForm = document.querySelector('#movieForm');

movieForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.querySelector('#movieTitle').value;
    const description = document.querySelector('#movieDescription').value;
    const release_date = document.querySelector('#movieReleaseDate').value;

    try {
        const response = await fetch('http://localhost:3000/movies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, release_date })
        });

        const result = await response.json();
        alert(result.message);

        if (response.ok) {
            // Очистить форму после успешного добавления
            movieForm.reset();
        }
    } catch (error) {
        console.error('Ошибка добавления фильма:', error);
        alert('Ошибка добавления фильма, попробуйте снова.');
    }
});

async function loadMovies() {
    try {
        const response = await fetch('http://localhost:3000/movies');
        const movies = await response.json();

        const movieList = document.querySelector('#movieList');
        movieList.innerHTML = '';

        movies.forEach(movie => {
            const movieItem = document.createElement('div');
            movieItem.classList.add('movie-item');
            movieItem.innerHTML = `
                <h3>${movie.title}</h3>
                <p>${movie.description}</p>
                <small>Release Date: ${movie.release_date}</small>
            `;
            movieList.appendChild(movieItem);
        });
    } catch (error) {
        console.error('Ошибка загрузки фильмов:', error);
    }
}

// Вызов функции загрузки фильмов при загрузке страницы
document.addEventListener('DOMContentLoaded', loadMovies);
