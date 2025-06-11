import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { listarCandidatos } from '../../../controllers/candidaturaController.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // 👉 Rota para empresa listar candidatos da vaga
    return await listarCandidatos(req, res);
  }

  if (req.method === 'POST') {
    // 👉 Rota para aluno se candidatar à vaga com upload
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
    });

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Erro ao processar formulário:', err);
        return res.status(500).json({ error: 'Erro ao processar formulário' });
      }

      const matricula = Array.isArray(fields.matricula) ? fields.matricula[0] : fields.matricula;
      const vagas_id = Array.isArray(fields.vagas_id) ? fields.vagas_id[0] : fields.vagas_id;
      const arquivo = Array.isArray(files.curriculo) ? files.curriculo[0] : files.curriculo;

      if (!matricula || !vagas_id || !arquivo || !arquivo.filepath) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }

      const nomeArquivo = path.basename(arquivo.filepath);
      const caminhoRelativo = `/uploads/${nomeArquivo}`;

      try {
        const { connect } = await import('../../../config/db.js');
        const db = await connect();

        const [existente] = await db.execute(
          'SELECT * FROM candidaturas WHERE matricula = ? AND vagas_id = ?',
          [matricula, vagas_id]
        );

        if (existente.length > 0) {
          return res.status(400).json({ error: 'Você já se candidatou para essa vaga' });
        }

        await db.execute(
          'INSERT INTO candidaturas (matricula, vagas_id, curriculo) VALUES (?, ?, ?)',
          [matricula, vagas_id, caminhoRelativo]
        );

        return res.status(201).json({ message: 'Candidatura realizada com sucesso' });
      } catch (error) {
        console.error('Erro ao registrar candidatura:', error);
        return res.status(500).json({ error: 'Erro ao registrar candidatura', detail: error.message });
      }
    });
  } else {
    // Qualquer outro método: não permitido
    return res.status(405).json({ error: 'Método não permitido' });
  }
}
