import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { categoryRouter, comandaRouter, orderRouter, productRouter, authRouter, establishmentRouter, metricsRouter, receiptRouter, roleRouter, employeeRouter } from './router';
import { AppDataSource } from './database';
import { errorHandler } from './middleware';

dotenv.config();

const app = express();

// 👇 Já deixei o limite de 50mb configurado para a imagem da Logo passar!
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());

AppDataSource.initialize().then(async () => {
    app.use('/api/v1', authRouter)
    app.use('/api/v1', categoryRouter)
    app.use('/api/v1', comandaRouter)
    app.use('/api/v1', orderRouter)
    app.use('/api/v1', productRouter)
    app.use('/api/v1/estabelecimento', establishmentRouter)
    app.use('/api/v1/metricas', metricsRouter)
    app.use('/api/v1/receipts', receiptRouter)
    
    app.use('/api/v1/roles', roleRouter)
    
    // 👇 AQUI ESTÁ A LIGAÇÃO QUE FALTAVA! 🔌
    app.use('/api/v1/funcionario', employeeRouter)

    app.use(errorHandler)

    const PORT = 3000;
    
    app.listen(PORT, () => {
        console.log(`🚀 Server rodando em http://localhost:${PORT}`);
    });
})