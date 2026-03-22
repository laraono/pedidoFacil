const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const pool = require('./config/db');
require('dotenv').config();

// 1. Importando o arquivo de rotas que criamos
const authRoutes = require('./routes/authRoutes');
app.use(cookieParser())
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  try {
    await pool.query('SELECT 1');
    console.log('Conectado ao banco de dados MySQL!');
  } catch (error) {
    console.log('Erro ao conectar no banco de dados:', error.message);
  }
});