import express from 'express'

export const pedidoRouter = express.Router()

pedidoRouter.post("/orders")

pedidoRouter.get("/orders/queue")

pedidoRouter.patch("orders/:id/status")

pedidoRouter.post("orders/:id/cancel")
