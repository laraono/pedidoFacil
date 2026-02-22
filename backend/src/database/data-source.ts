import "reflect-metadata"
import { DataSource } from "typeorm"
import { Assinatura } from "./entities/Assinatura"
import { Cargo } from "./entities/Cargo"
import { Categoria } from "./entities/Categoria"
import { Comanda } from "./entities/Comanda"
import { Configuracao } from "./entities/Configuracao"
import { Cupom } from "./entities/Cupom"
import { Estabelecimento } from "./entities/Estabelecimento"
import { EstoqueItem } from "./entities/EstoqueItem"
import { ItemPedido } from "./entities/ItemPedido"
import { MovimentacaoEstoque } from "./entities/MovimentacaoEstoque"
import { NotaFiscal } from "./entities/NotaFiscal"
import { Pagamento } from "./entities/Pagamento"
import { PagamentoPedido } from "./entities/PagamentoPedido"
import { Pedido } from "./entities/Pedido"
import { Plano } from "./entities/Plano"
import { Produto } from "./entities/Produto"
import { Usuario } from "./entities/Usuario"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: 'localhost',
    port: 3307,
    username: 'root',
    password: 'root',
    database: 'foodsystem_db',
    synchronize: true,
    logging: false,
    entities: [
        Assinatura, Cargo, Categoria, Comanda, Configuracao, Cupom, Estabelecimento, EstoqueItem, ItemPedido, 
        MovimentacaoEstoque, NotaFiscal, Pagamento, PagamentoPedido, Pedido, Plano, Produto, Usuario
    ],
    migrations: ["src/database/migration/*.ts"],
    subscribers: [],
})
