const mysql = require('mysql2/promise');

async function createUserAndDatabase() {
  try {
    // Підключаємося до MySQL як root (адмін)
    const connection = await mysql.createConnection({
      host: '172.18.192.1',
      port: 3307,
      user: 'market',              // або інший користувач з правами адміністратора
      password: 'greenMarket12', // пароль адміністратора
    });

    // Створюємо базу даних, якщо вона не існує
    await connection.query(`CREATE DATABASE IF NOT EXISTS ratatouille;`);

    // Створюємо нового користувача, якщо його ще немає
    await connection.query(`
      CREATE USER IF NOT EXISTS 'userAdmin'@'%' IDENTIFIED BY 'password';
    `);

    // Надаємо новому користувачу всі права на базу даних myapp_db
    await connection.query(`
      GRANT ALL PRIVILEGES ON ratatouille.* TO 'userAdmin'@'%';
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
