const express = require('express');
const db = require('./config/db'); // ajuste o caminho se necessário
const app = express();

app.use(express.json());

// Rota de teste de conexão
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ message: "Conectado ao MySQL com sucesso!", result: rows[0].result });
  } catch (error) {
    res.status(500).json({ error: "Erro ao conectar no banco", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
