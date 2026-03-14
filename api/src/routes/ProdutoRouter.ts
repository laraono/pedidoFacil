import express from 'express'

export const produtoRouter = express.Router()

produtoRouter.get("/products")

produtoRouter.post("/products")

produtoRouter.put("/products/:id")

produtoRouter.put("/products/:id")
