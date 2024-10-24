const mysql = require('mysql2/promise');

async function createUserAndDatabase() {
  try {
    // Підключаємося до MySQL як root (адмін)
    const connection = await mysql.createConnection({
      host: '192.168.56.1',
      user: 'ubuntu',              // або інший користувач з правами адміністратора
      password: 'greenMarket12', // пароль адміністратора
    });

    // Створюємо базу даних, якщо вона не існує
    await connection.query(`CREATE DATABASE IF NOT EXISTS AppName;`);

    // Створюємо нового користувача, якщо його ще немає
    await connection.query(`
      CREATE USER IF NOT EXISTS 'app'@'%' IDENTIFIED BY 'mealApp';
    `);

    // Надаємо новому користувачу всі права на базу даних myapp_db
    await connection.query(`
      GRANT ALL PRIVILEGES ON AppName.* TO 'app'@'%';
    `);

    // Оновлюємо привілеї
    await connection.query(`FLUSH PRIVILEGES;`);

    console.log('Користувач створений, база даних створена, і права надані.');
    await connection.end();
  } catch (err) {
    console.error('Error creating user or database:', err);
  }
}

createUserAndDatabase();
