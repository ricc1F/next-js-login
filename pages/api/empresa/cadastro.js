import { cadastroEmpresa } from '../../../controllers/empresaController.js'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await cadastroEmpresa(req, res)
  } else {
    res.status(405).json({ error: 'Método não permitido' })
  }
}
