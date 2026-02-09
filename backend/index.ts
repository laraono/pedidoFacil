import express from 'express'
import "reflect-metadata"
import db from './db.js';
import { authRouter } from './src/routes/AuthRouter';
import { AppDataSource } from './src/database/data-source';

const app = express();

AppDataSource.initialize()
    .then(() => {
        app.use(express.json());
        app.use('/api/v1/auth', authRouter);
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
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });