import express from 'express'

export const comandaRouter = express.Router()

comandaRouter.get("/commands")

comandaRouter.post("/commands")

comandaRouter.put("/commands/:id/close")

