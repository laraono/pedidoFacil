import "reflect-metadata"
import { DataSource } from "typeorm"
import { Comanda } from "./entity/Comanda"
import { Category } from "./entity/Category"
import { Order } from "./entity/Order"
import { Product } from "./entity/Product"
import { ProductOrder } from "./entity/ProductOrder"
import { ProductVariation } from "./entity/ProductVariation"
import { ProductVariationOrder } from "./entity/ProductVariationOrder"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "root",
    database: "pedido_facil",
    synchronize: false,
    logging: false,
    entities: [Comanda, Category, Order, Product, ProductOrder, ProductVariation, ProductVariationOrder],
    migrations: ['build/database/migration/*.js'],
    subscribers: [],
})
