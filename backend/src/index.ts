import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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
    configRouter,
    planRouter,
    subscriptionRouter,
    contactRouter,
    adminRouter,
    webhookRouter,
    paymentRouter,
} from './router';
import { AppDataSource } from './database';
import { errorHandler, publicLimiter, authenticatedLimiter } from './middleware';
import { initSocket } from './socket';
import { logger } from './utils/logger';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não está definido. Verifique o arquivo .env');
}

process.on('unhandledRejection', (reason) => {
    logger.error('unhandledRejection', { reason });
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    logger.error('uncaughtException', { message: err.message, stack: err.stack });
    process.exit(1);
});

const app = express();

app.set('trust proxy', 1);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || origin.includes('localhost') || origin.includes('192.168') || origin === process.env.FRONTEND_URL) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-totem-code'],
}));
app.use(cookieParser());

const httpServer = http.createServer(app);

AppDataSource.initialize().then(async () => {
    app.use('/api/v1/admin', authenticatedLimiter, adminRouter)
    app.use('/api/v1', publicLimiter, authRouter);
    app.use('/api/v1', authenticatedLimiter, categoryRouter);
    app.use('/api/v1', authenticatedLimiter, comandaRouter);
    app.use('/api/v1', authenticatedLimiter, orderRouter);
    app.use('/api/v1', authenticatedLimiter, productRouter);
    app.use('/api/v1', authenticatedLimiter, menuRouter);
    app.use('/api/v1/estabelecimento', authenticatedLimiter, establishmentRouter);
    app.use('/api/v1/metrics', authenticatedLimiter, metricsRouter);
    app.use('/api/v1/receipts', authenticatedLimiter, receiptRouter);
    app.use('/api/v1/roles', authenticatedLimiter, roleRouter);
    app.use('/api/v1/funcionario', authenticatedLimiter, employeeRouter);
    app.use('/api/v1/conta', authenticatedLimiter, profileRouter);
    app.use('/api/v1/cupons', authenticatedLimiter, couponRouter);
    app.use('/api/v1', authenticatedLimiter, configRouter);
    app.use('/api/v1', publicLimiter, planRouter);
    app.use('/api/v1', authenticatedLimiter, subscriptionRouter);
    app.use('/api/v1/contato', contactRouter);
    app.use('/api/v1', authenticatedLimiter, paymentRouter);
    app.use('/webhook', publicLimiter, webhookRouter);
    app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
    app.use((req, res) => {
        res.status(404).json({ error: 'Página não encontrada.' });
    });

    app.use(errorHandler);

    const PORT = 3000;

    initSocket(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server rodando em http://localhost:${PORT}`);
        console.log(` Socket.IO ativo na porta ${PORT}`);
    });
}).catch(error => console.log("Erro na inicialização do Banco:", error));
