import { deletarVaga } from '../../../controllers/vagaController.js'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    return deletarVaga(req, res)
  }

  res.setHeader('Allow', ['DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
