import { login } from '../../../controllers/userController'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return await login(req, res)
  } else {
    res.status(405).json({ error: 'Método não permitido' })
  }
}