import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors'
import { comandaRouter, orderRouter } from './router';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())

// Configuração da conexão com o banco
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pedido_facil'
});

// Rota de teste
app.get('/', async (req, res) => {
    try {
        // Testando conexão com o banco
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ message: 'API Pedido Fácil Online!', db_connection: 'OK', data: rows });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao conectar no banco', details: error });
    }
});

app.use('/api/v1', comandaRouter)
app.use('/api/v1', orderRouter)

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});
