import express from 'express';
import {
  criarVaga,
  listarVagas,
  listarTodasAsVagas,
  buscarVagaPorId,
  editarVaga,
  deletarVaga
} from '../controllers/vagaController.js';

const router = express.Router();

router.get('/vagas', listarTodasAsVagas);           // público
router.get('/vagas/empresa', listarVagas);          // ?id_empresa=...
router.get('/vagas/detalhe', buscarVagaPorId);      // ?id=...
router.post('/vagas', criarVaga);                   // criar vaga
router.put('/vagas', editarVaga);                   // ?id=...
router.delete('/vagas', deletarVaga);               // ?id=...

export default router;
