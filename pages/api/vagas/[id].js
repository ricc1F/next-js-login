import { atualizarVaga, excluirVaga } from '@/backend/vagaController'

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'PUT') {
    return atualizarVaga(req, res, id)
  }

  if (req.method === 'DELETE') {
    return excluirVaga(req, res, id)
  }

  return res.status(405).end(`Method ${req.method} Not Allowed`)
}
