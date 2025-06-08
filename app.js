import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes.js'
import vagasRoutes from './routes/vagaRoute.js'
import Home from '@/app/home/page.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())

app.use('/api/', userRoutes)
app.use('/api/', vagasRoutes) // ← Aqui já inclui todas as rotas de vagas

app.listen(3001, () => console.log(`Servidor rodando na porta 3001`))
