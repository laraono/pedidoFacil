import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { categoryRouter, comandaRouter, orderRouter, productRouter, authRouter } from './router';
import { AppDataSource } from './database';
import { errorHandler } from './middleware';
import { initSocket } from './socket';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:8081',
        'exp://localhost:8081',
    ],
    credentials: true
}));
app.use(cookieParser());

const httpServer = http.createServer(app);

AppDataSource.initialize().then(async () => {
    app.use('/api/v1', authRouter)
    app.use('/api/v1', categoryRouter)
    app.use('/api/v1', comandaRouter)
    app.use('/api/v1', orderRouter)
    app.use('/api/v1', productRouter)

    app.use(errorHandler)

    const PORT = 3000;

    initSocket(httpServer);


    httpServer.listen(PORT, () => {
        console.log(`🚀 Server rodando em http://localhost:${PORT}`);
        console.log(` Socket.IO ativo na porta ${PORT}`);
    });
})