import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import userRoutes from './routes/userRoutes.js'
import vagasRoutes from './routes/vagaRoute.js'

dotenv.config()

const app = express()

// CORS global
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

// CORS para preflight OPTIONS requests
app.options('*', cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())




app.use('/api/', userRoutes)
app.use('/api/', vagasRoutes)

app.listen(3001, () => console.log(`Servidor rodando na porta 3001`))
