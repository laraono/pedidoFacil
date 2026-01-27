const mysql = require('mysql2');
require('dotenv').config();

// Criamos um "Pool" de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Máximo de 10 conexões simultâneas
  queueLimit: 0
});

// Exportamos o pool usando .promise() para podermos usar async/await no resto do projeto
const db = pool.promise();

// Teste rápido de conexão ao iniciar o servidor
db.getConnection()
  .then(conn => {
    console.log("✅ Conectado ao banco de dados MySQL!");
    conn.release(); // Libera a conexão de volta para o pool
  })
  .catch(err => {
    console.error("❌ Erro ao conectar ao banco de dados:", err.message);
  });

module.exports = db;
