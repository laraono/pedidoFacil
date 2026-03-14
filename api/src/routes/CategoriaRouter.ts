import express from 'express'

export const categoriaRouter = express.Router()

categoriaRouter.get("/categories")

categoriaRouter.post("/categories")

categoriaRouter.put("/categories/:id")

categoriaRouter.put("/categories/:id")
