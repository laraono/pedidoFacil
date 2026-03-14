import express from 'express'

export const pagamentoRouter = express.Router()

pagamentoRouter.post("/payments/cashier/finalize")

