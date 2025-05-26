import { cadastro } from '../../../controllers/userController'

export default function handler(req, res) {
  if (req.method === 'POST') {
    return cadastro(req, res)
  }

  return res.status(405).json({ message: 'Método não permitido' })
}
