import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/user', userRoutes)

app.listen(3000, () => console.log(`Servidor rodando na porta $po`))
