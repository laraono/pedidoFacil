import express from 'express'

export const notaFiscalRouter = express.Router()

notaFiscalRouter.post("/invoices/emit")

notaFiscalRouter.get("/invoices/:id")
