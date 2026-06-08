import "reflect-metadata"
import "dotenv/config"
import { DataSource } from "typeorm"
import {
    Admin, Category, Comanda, Configuration, Coupon, Establishment,
    Order, Payment, PaymentOrder, Plan, Product, ProductOrder,
    ProductVariation, Receipt, RefreshToken, Role, StorageIten,
    StorageMovimentation, Subscription, SubscriptionPayment, User, Register
} from "./entity/"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "foodsystem_db",
    synchronize: false,
    logging: false,
    entities: [
        Admin, Category, Comanda, Configuration, Coupon, Establishment,
        Order, Payment, PaymentOrder, Plan, Product, ProductOrder,
        ProductVariation, Receipt, RefreshToken, Role, StorageIten,
        StorageMovimentation, Subscription, SubscriptionPayment, User, Register
    ],
    migrations: [__dirname + '/migration/*{.ts,.js}'],
    subscribers: [],
})
