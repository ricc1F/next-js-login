import {
    buscarVagaPorId,
    editarVaga,
    deletarVaga
  } from '../../../controllers/vagaController'
  
  export default async function handler(req, res) {
    if (req.method === 'GET') {
      return buscarVagaPorId(req, res)
    } else if (req.method === 'PUT') {
      return editarVaga(req, res)
    } else if (req.method === 'DELETE') {
      return deletarVaga(req, res)
    } else {
      res.status(405).json({ error: 'Método não permitido' })
    }
  }  