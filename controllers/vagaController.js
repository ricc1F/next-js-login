import { connect } from '../config/db.js'

export async function criarVaga(req, res) {
  const {
    tipo_vaga,
    descricao,
    area,
    salario,
    endereco,
    atividades,
    requisitos,
    horario,
    caracteristica,
    id_empresa
  } = req.body

  if (!tipo_vaga || !descricao || !area || !salario || !endereco || !atividades || !requisitos || !horario || !caracteristica || !id_empresa) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
  }

  try {
    const db = await connect()
    await db.execute(
      `INSERT INTO vagas (
        tipo_vaga, descricao, area, salario, endereco,
        atividades, requisitos, horario, caracteristica, id_empresa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [tipo_vaga, descricao, area, salario, endereco, atividades, requisitos, horario, caracteristica, id_empresa]
    )
    res.status(201).json({ message: 'Vaga criada com sucesso' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar vaga', detail: err.message })
  }
}

// Listar todas as vagas
export async function listarVagas(req, res) {
  try {
    const db = await connect()
    const [vagas] = await db.execute(
      `SELECT v.*, e.nome_empresa 
       FROM vagas v 
       JOIN empresa e ON v.id_empresa = e.id`
    )
    res.status(200).json(vagas)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar vagas', detail: err.message })
  }
}

// Buscar vaga por ID
export async function buscarVagaPorId(req, res) {
  const { id } = req.query

  try {
    const db = await connect()
    const [vaga] = await db.execute('SELECT * FROM vagas WHERE vagas_id = ?', [id])

    if (vaga.length === 0) return res.status(404).json({ error: 'Vaga não encontrada' })

    res.status(200).json(vaga[0])
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar vaga', detail: err.message })
  }
}

// Editar vaga
export async function editarVaga(req, res) {
  const { id } = req.query
  const {
    tipo_vaga,
    descricao,
    area,
    salario,
    endereco,
    atividades,
    requisitos,
    horario,
    caracteristica
  } = req.body

  if (!id) return res.status(400).json({ error: 'ID da vaga não informado' })

  try {
    const db = await connect()
    const [result] = await db.execute(
      `UPDATE vagas SET
        tipo_vaga = ?, descricao = ?, area = ?, salario = ?, endereco = ?,
        atividades = ?, requisitos = ?, horario = ?, caracteristica = ?
       WHERE vagas_id = ?`,
      [tipo_vaga, descricao, area, salario, endereco, atividades, requisitos, horario, caracteristica, id]
    )

    console.log('Update result:', result)

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vaga não encontrada para atualizar' })
    }

    res.status(200).json({ message: 'Vaga atualizada com sucesso' })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar vaga', detail: err.message })
  }
}


// Deletar vaga
export async function deletarVaga(req, res) {
  const { id } = req.query
  console.log('Tentando deletar vaga ID:', id)

  if (!id) return res.status(400).json({ error: 'ID da vaga não informado' })

  try {
    const db = await connect()
    const [result] = await db.execute('DELETE FROM vagas WHERE vagas_id = ?', [id])

    console.log('Resultado da exclusão:', result)

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vaga não encontrada para deletar' })
    }

    res.status(200).json({ message: 'Vaga deletada com sucesso' })
  } catch (err) {
    console.error('Erro ao excluir vaga:', err)
    res.status(500).json({ error: 'Erro ao deletar vaga', detail: err.message })
  }
}
