import { listarCandidatos } from '../../../../../controllers/candidaturaController.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    await listarCandidatos(req, res)
  } else {
    res.status(405).json({ error: 'Método não permitido' })
  }
}
