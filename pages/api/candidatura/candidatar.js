import { candidatarAluno } from '../../../controllers/candidaturaController.js'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await candidatarAluno(req, res)
  } else {
    res.status(405).json({ error: 'Método não permitido' })
  }
}
