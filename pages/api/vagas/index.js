import { listarVagas, criarVaga } from '../../../controllers/vagaController.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return listarVagas(req, res)
  } else if (req.method === 'POST') {
    return criarVaga(req, res)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}