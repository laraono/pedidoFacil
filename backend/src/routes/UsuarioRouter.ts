import express from 'express'

export const usuarioRouter = express.Router()

usuarioRouter.get("/users")

usuarioRouter.post("/users")

usuarioRouter.put("/users/:id")

usuarioRouter.put("/users/:id")
