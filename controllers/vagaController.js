import { connect } from '../config/db.js'

// Criar vaga
export async function criarVaga(req, res) {
  const {
    descricao,
    area,
    salario,
    endereco,
    estado,
    atividades,
    requisitos,
    horario,
    caracteristica,
    id_empresa
  } = req.body

  if (!descricao || !area || !salario || !endereco || !estado || !atividades || !requisitos || !horario || !caracteristica || !id_empresa) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
  }

  try {
    const db = await connect()
    await db.execute(
      `INSERT INTO vagas (
        area, descricao, salario, endereco, estado,
        atividades, requisitos, horario, caracteristica, id_empresa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        area,
        descricao,
        salario,
        endereco,
        estado,
        atividades,
        requisitos,
        horario,
        caracteristica,
        id_empresa
      ]
    )
    res.status(201).json({ message: 'Vaga criada com sucesso' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar vaga', detail: err.message })
  }
}
