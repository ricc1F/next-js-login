import { editarVaga, deletarVaga } from '../../../controllers/vagaController'

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    return editarVaga(req, res)
  } else if (req.method === 'DELETE') {
    return deletarVaga(req, res)
  }

  res.setHeader('Allow', ['PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
