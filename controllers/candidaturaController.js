import { connect } from '../config/db.js'

// Candidatar aluno a uma vaga

export async function candidatarAluno(req, res) {
    const { matricula, vagas_id } = req.body
  
    if (!matricula || !vagas_id) {
      return res.status(400).json({ error: 'Campos obrigatórios: matricula e vagas_id' })
    }
  
    try {
      const db = await connect()
  
      // Verificar se já existe candidatura
      const [existente] = await db.execute(
        'SELECT * FROM candidaturas WHERE matricula_aluno = ? AND vagas_id = ?',
        [matricula, vagas_id]
      )
  
      if (existente.length > 0) {
        return res.status(400).json({ error: 'Você já se candidatou para essa vaga' })
      }
  
      await db.execute(
        'INSERT INTO candidaturas (matricula_aluno, vagas_id) VALUES (?, ?)',
        [matricula, vagas_id]
      )
  
      res.status(201).json({ message: 'Candidatura realizada com sucesso' })
    } catch (err) {
      res.status(500).json({ error: 'Erro ao registrar candidatura', detail: err.message })
    }
  }

// Listar candidatos por vaga (para empresa ver)
export async function listarCandidatos(req, res) {
  const { vagas_id } = req.query

  try {
    const db = await connect()
    const [result] = await db.execute(`
      SELECT a.nome_aluno, a.email, c.data_candidatura
      FROM candidaturas c
      JOIN aluno a ON c.matricula = a.matricula
      WHERE c.vagas_id = ?
    `, [vagas_id])

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar candidatos', detail: err.message })
  }
}
