import express from 'express'
import "reflect-metadata"
import db from './db';
import { authRouter } from './src/routes/AuthRouter';
import { cargoRouter } from './src/routes/CargoRouter'
import { categoriaRouter } from './src/routes/CategoriaRouter'
import { comandaRouter } from './src/routes/ComandaRouter'
import { notaFiscalRouter } from './src/routes/NotaFiscalRouter'
import { pagamentoRouter } from './src/routes/PagamentoRouter'
import { pedidoRouter } from './src/routes/PedidoRouter'
import { produtoRouter } from './src/routes/ProdutoRouter'
import { usuarioRouter } from './src/routes/UsuarioRouter'
import { AppDataSource } from './src/database/data-source';

const app = express();

AppDataSource.initialize()
    .then(() => {
        app.use(express.json());
        app.use('/api/v1/auth', authRouter);
        app.use('/api/v1', cargoRouter)
        app.use('/api/v1', categoriaRouter)
        app.use('/api/v1', comandaRouter)
        app.use('/api/v1', notaFiscalRouter)
        app.use('/api/v1', pagamentoRouter)
        app.use('/api/v1', pedidoRouter)
        app.use('/api/v1', produtoRouter)
        app.use('/api/v1', usuarioRouter)
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });