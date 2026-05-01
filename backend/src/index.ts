import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser'
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
    subscriptionRouter
} from './router';
import { AppDataSource } from './database';
import { errorHandler } from './middleware';
import { initSocket } from './socket';

dotenv.config();

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

AppDataSource.initialize().then(async () => {
    app.use('/api/v1', planRouter)
    app.use('/api/v1/estabelecimento', establishmentRouter)
    app.use('/api/v1/conta', profileRouter)
    app.use('/api/v1', configRouter)
    app.use('/api/v1', authRouter)
    app.use('/api/v1', categoryRouter)
    app.use('/api/v1', comandaRouter)
    app.use('/api/v1', orderRouter)
    app.use('/api/v1', productRouter)
    
    app.use('/api/v1', menuRouter)

    app.use('/api/v1/metrics', metricsRouter)
    app.use('/api/v1/receipts', receiptRouter)
    app.use('/api/v1/roles', roleRouter)
    app.use('/api/v1/funcionario', employeeRouter)
    app.use('/api/v1/cupons', couponRouter)
    app.use('/api/v1', subscriptionRouter)

    app.use(errorHandler)

    const PORT = 3000;

    initSocket(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server rodando em http://localhost:${PORT}`);
        console.log(` Socket.IO ativo na porta ${PORT}`);
    });
}).catch(error => console.log("Erro na inicialização do Banco:", error));