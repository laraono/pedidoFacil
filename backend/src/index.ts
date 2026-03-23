import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors'
import { categoryRouter, comandaRouter, orderRouter, productRouter } from './router';
import { AppDataSource } from './database';
import { errorHandler } from './middleware';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())
AppDataSource.initialize().then(async () => {
    app.use('/api/v1', categoryRouter)
    app.use('/api/v1', comandaRouter)
    app.use('/api/v1', orderRouter)
    app.use('/api/v1', productRouter)

    app.use(errorHandler)

    const PORT = 3000;
    
    app.listen(PORT, () => {
        console.log(`🚀 Server rodando em http://localhost:${PORT}`);
    });
})


