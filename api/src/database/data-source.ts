import "reflect-metadata"
import { DataSource } from "typeorm"
import { Comanda } from "./entity/Comanda"
import { Addon } from "./entity/Addon"
import { Category } from "./entity/Category"
import { Order } from "./entity/Order"
import { Product } from "./entity/Product"
import { ProductOrder } from "./entity/ProductOrder"
import { Size } from "./entity/Size"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "root",
    database: "pedido_facil",
    synchronize: false,
    logging: false,
    entities: [Comanda, Addon, Category, Order, Product, ProductOrder, Size],
    migrations: ['build/database/migration/*.js'],
    subscribers: [],
})
