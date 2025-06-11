import { connect } from '../config/db.js'

// Candidatar aluno a uma vaga
export async function candidatarAluno(req, res) {
  const { matricula, vagas_id } = req.body

  if (!matricula || !vagas_id) {
    return res.status(400).json({ error: 'Campos obrigatórios: matricula e vagas_id' })
  }

  try {
    const db = await connect()

    // Verifica se o aluno já se candidatou à vaga
    const [existente] = await db.execute(
      'SELECT * FROM candidaturas WHERE matricula = ? AND vagas_id = ?',
      [matricula, vagas_id]
    )

    if (existente.length > 0) {
      return res.status(400).json({ error: 'Você já se candidatou para essa vaga' })
    }

    // Insere nova candidatura
    await db.execute(
      'INSERT INTO candidaturas (matricula, vagas_id) VALUES (?, ?)',
      [matricula, vagas_id]
    )

    return res.status(201).json({ message: 'Candidatura realizada com sucesso' })
  } catch (err) {
    console.error('Erro ao registrar candidatura:', err)
    return res.status(500).json({ error: 'Erro ao registrar candidatura', detail: err.message })
  }
}

/// Listar candidatos por vaga (para empresa ver)
export async function listarCandidatos(req, res) {
  const { vagas_id } = req.query;

  if (!vagas_id) {
    return res.status(400).json({ error: 'vagas_id é obrigatório na query' });
  }

  try {
    const db = await connect();
    const [result] = await db.execute(`
      SELECT 
        a.nome_aluno, 
        a.email, 
        c.data_candidatura, 
        c.curriculo
      FROM candidaturas c
      JOIN aluno a ON c.matricula = a.matricula
      WHERE c.vagas_id = ?
    `, [vagas_id]);


    const candidatosComLink = result.map(candidato => ({
      ...candidato,
      linkCurriculo: `${process.env.NEXT_PUBLIC_BASE_URL || ''}${candidato.curriculo}`
    }));

    return res.status(200).json(candidatosComLink);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar candidatos', detail: err.message });
  }
}
