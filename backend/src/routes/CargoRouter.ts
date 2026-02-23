import express from 'express'

export const cargoRouter = express.Router()

cargoRouter.get("/roles")

cargoRouter.post("/roles")

cargoRouter.put("/roles/:id")

cargoRouter.delete("/roles/:id")

