import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { 
    categoryRouter, 
    comandaRouter, 
    orderRouter, 
    productRouter, 
    authRouter, 
    establishmentRouter, 
    metricsRouter, 
    receiptRouter, 
    roleRouter, 
    employeeRouter, 
    profileRouter, 
    couponRouter,
    menuRouter,
    configRouter 
} from './router';
import { AppDataSource } from './database';
import { errorHandler } from './middleware';
import { initSocket } from './socket';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não está definido. Verifique o arquivo .env');
}

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

const publicLimiter = rateLimit({
    windowMs: 60 * 1000,        // janela de 1 minuto
    max: 100,                    // 100 req por IP por janela
    standardHeaders: true,       // responde com headers X-RateLimit-*
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Aguarde um momento.' }
})

const authenticatedLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Aguarde um momento.' }
})

AppDataSource.initialize().then(async () => {
    app.use('/api/v1', publicLimiter, authRouter)
    app.use('/api/v1', authenticatedLimiter, categoryRouter)
    app.use('/api/v1', authenticatedLimiter, comandaRouter)
    app.use('/api/v1', authenticatedLimiter, orderRouter)
    app.use('/api/v1', authenticatedLimiter, productRouter)
    
    app.use('/api/v1', authenticatedLimiter, menuRouter)

    app.use('/api/v1/estabelecimento', authenticatedLimiter, establishmentRouter)
    app.use('/api/v1/metrics', authenticatedLimiter, metricsRouter)
    app.use('/api/v1/receipts', authenticatedLimiter, receiptRouter)
    app.use('/api/v1/roles', authenticatedLimiter, roleRouter)
    app.use('/api/v1/funcionario', authenticatedLimiter, employeeRouter)
    app.use('/api/v1/conta', authenticatedLimiter, profileRouter)
    app.use('/api/v1/cupons', authenticatedLimiter, couponRouter)
    app.use('/api/v1', authenticatedLimiter, configRouter)

    app.use(errorHandler)

    const PORT = 3000;

    initSocket(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server rodando em http://localhost:${PORT}`);
        console.log(` Socket.IO ativo na porta ${PORT}`);
    });
}).catch(error => console.log("Erro na inicialização do Banco:", error));