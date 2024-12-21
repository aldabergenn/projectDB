const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3000;



app.use(cors({
  origin: 'http://127.0.0.1:5500', // Укажите полный URL, включая протокол
  credentials: true,              // Разрешаем отправку cookies (для сессий)
  methods: 'GET,POST,PUT,DELETE', // Разрешаем нужные HTTP-методы
  allowedHeaders: 'Content-Type, Authorization', // Разрешаем определенные заголовки
}));

// // Парсинг JSON
app.use(express.json());

app.use(session({
  secret: 'localProject',
  resave: false,
  saveUninitialized: true,
  cookie: { httpOnly: true, secure: false }, // При необходимости настройте cookies
}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'users'
});

// Проверка подключения
db.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных: ', err.stack);
  } else {
    console.log('Подключено к базе данных');
  }
});

// Обработчики маршрутов
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  // Проверка, что все поля заполнены
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
  }

  // Хеширование пароля
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка хеширования пароля' });
    }

    // Запрос на добавление пользователя в базу данных
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Ошибка при добавлении пользователя:', err);
        return res.status(500).json({ error: 'Ошибка при добавлении пользователя' });
      }

      res.status(200).json({ message: 'Пользователь успешно зарегистрирован' });
    });
  });
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все поля' });
  }

  // Запрос в базу данных для поиска пользователя по email
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка базы данных' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Пользователь не найден' });
    }

    // Получаем пользователя из результата запроса
    const user = results[0];

    // Сравниваем пароли
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка сервера' });
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Неверный пароль' });
      }

      req.session.userId = user.id;

      // Успешный логин, возвращаем userId
      res.json({ message: 'Логин успешен', userId: user.id });
    });
  });
});

app.get('/login', (req, res) => {
  console.log(path.join(__dirname, 'index.html'))
  res.sendFile(path.join(__dirname, 'index.html'));  
});



app.post('/movie', (req, res) => {
  const { title, description, release_date, image_url, user_id } = req.body;
  if (!title || !release_date || !image_url || !user_id) {
      return res.status(400).json({ message: 'Необходимо указать название, дату выхода, URL изображения, user_id' });
  }

  const query = 'INSERT INTO movies (title, description, release_date, image_url, user_id) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [title, description, release_date, image_url, user_id], (err, result) => {
      if (err) {
          console.error('Ошибка добавления фильма:', err);
          return res.status(500).json({ message: 'Ошибка сервера' });
      }

      res.status(201).json({ message: 'Фильм успешно добавлен', movieId: result.insertId });
  });
});

app.get('/movies', (req, res) => {
  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ message: 'Необходимо указать user_id' });
  }
  const query = 'SELECT * FROM movies WHERE user_id = ?';
  db.query(query,[user_id], (err, results) => {
      if (err) {
          console.error('Ошибка получения фильмов:', err);
          return res.status(500).json({ message: 'Ошибка сервера' });
      }

      res.status(200).json(results);
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    console.log('Logout requested');  // Логируем запрос на выход
    if (err) {
      console.log(err);
      return res.status(500).json({ message: 'Ошибка при выходе из системы' });
    }
    res.clearCookie('connect.sid'); // Очистить cookie сессии
    res.json({ message: 'Вы успешно вышли из системы' });
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});