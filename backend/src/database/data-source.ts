import "reflect-metadata"
import "dotenv/config"
import { DataSource } from "typeorm"
import {
    Admin, Category, Comanda, Configuration, Coupon, Endereco, Establishment,
    Order, Payment, PaymentMethod, PaymentOrder, Permissao, Plan, PlanFeature, Product, ProductOrder,
    ProductVariation, Receipt, RefreshTokenUser, RefreshTokenAdmin, Role, StatusAssinatura,
    StatusComanda, StatusHistoricoAssinatura, StatusNotaFiscal, StatusPagamento, StatusPedido,
    StorageIten, StorageMovimentation, Subscription, SubscriptionPayment, TipoDesconto,
    TipoMovimentacao, User, Register, PerfilGerente
} from "./entity/"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "foodsystem_db",
    synchronize: false,
    migrationsRun: false,
    logging: false,
    timezone: 'Z',
    entities: [
        Admin, Category, Comanda, Configuration, Coupon, Endereco, Establishment,
        Order, Payment, PaymentMethod, PaymentOrder, Permissao, Plan, PlanFeature, Product, ProductOrder,
        ProductVariation, Receipt, RefreshTokenUser, RefreshTokenAdmin, Role, StatusAssinatura,
        StatusComanda, StatusHistoricoAssinatura, StatusNotaFiscal, StatusPagamento, StatusPedido,
        StorageIten, StorageMovimentation, Subscription, SubscriptionPayment, TipoDesconto,
        TipoMovimentacao, User, Register, PerfilGerente
    ],
    migrations: [__dirname + '/migration/*{.ts,.js}'],
    subscribers: [],
})
