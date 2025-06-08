import {
  listarVagas,
  criarVaga,
  atualizarVaga,
  deletarVaga
} from '../../../controllers/vagaController';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return listarVagas(req, res);
    case 'POST':
      return criarVaga(req, res);
    case 'PUT':
      return atualizarVaga(req, res); 
    case 'DELETE':
      return deletarVaga(req, res);    
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Método ${method} não permitido` });
  }
}
