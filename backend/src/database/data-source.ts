import "reflect-metadata"
import { DataSource } from "typeorm"
import {
    Admin, Category, Comanda, Configuration, Coupon, Establishment,
    Order, Payment, PaymentOrder, Plan, Product, ProductOrder,
    ProductVariation, ProductVariationOrder, Receipt, RefreshToken, Role, StorageIten,
    StorageMovimentation, Subscription, User
} from "./entity/"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "root",
    database: "foodsystem_db",
    synchronize: false,
    logging: false,
    entities: [
        Admin, Category, Comanda, Configuration, Coupon, Establishment,
        Order, Payment, PaymentOrder, Plan, Product, ProductOrder,
        ProductVariation, ProductVariationOrder, Receipt, RefreshToken, Role, StorageIten,
        StorageMovimentation, Subscription, User
    ],
    migrations: ['build/database/migration/*.ts'],
    subscribers: [],
})
