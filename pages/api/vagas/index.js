import { criarVaga, listarVagas } from '../../../controllers/vagaController'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return listarVagas(req, res)
  } else if (req.method === 'POST') {
    return criarVaga(req, res)
  } else {
    res.status(405).json({ error: 'Método não permitido' })
  }
}
