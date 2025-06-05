import { connect } from '../config/db.js'

// Criar vaga
export async function criarVaga(req, res) {
  const {
    titulo,
    area,
    descricao,
    salario,
    endereco,
    estado,
    atividades,
    requisitos,
    horario,
    tipoDeVaga,
    id_empresa
  } = req.body;

  if (!titulo || !area || !descricao || !salario || !endereco || !estado || !atividades || !requisitos || !horario || !tipoDeVaga || !id_empresa) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const db = await connect();
    await db.execute(
      `INSERT INTO vagas (
        titulo, area, descricao, salario, endereco, estado,
        atividades, requisitos, horario, tipoDeVaga, id_empresa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        area,
        descricao,
        salario,
        endereco,
        estado,
        atividades,
        requisitos,
        horario,
        tipoDeVaga,
        id_empresa
      ]
    );
    res.status(201).json({ message: 'Vaga criada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar vaga', detail: err.message });
  }
}


// Listar todas as vagas
export async function listarVagas(req, res) {
  const { id_empresa } = req.query

  try {
    const db = await connect()
    const [vagas] = await db.execute(
      `SELECT * FROM vagas WHERE id_empresa = ? ORDER BY vagas_id DESC`,
      [id_empresa]
    )
    res.status(200).json(vagas)
  } catch (err) {
    console.error(err)
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
  const { id } = req.query;
  const {
    titulo,
    area,
    descricao,
    salario,
    endereco,
    estado,
    atividades,
    requisitos,
    horario,
    tipoDeVaga
  } = req.body;

  if (!id) return res.status(400).json({ error: 'ID da vaga não informado' });

  try {
    const db = await connect();
    const [result] = await db.execute(
      `UPDATE vagas SET 
        titulo = ?, area = ?, descricao = ?, salario = ?, endereco = ?, estado = ?, 
        atividades = ?, requisitos = ?, horario = ?, tipoDeVaga = ?
       WHERE vagas_id = ?`,
      [
        titulo,
        area,
        descricao,
        salario,
        endereco,
        estado,
        atividades,
        requisitos,
        horario,
        tipoDeVaga,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vaga não encontrada para atualizar' });
    }

    res.status(200).json({ message: 'Vaga atualizada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar vaga', detail: err.message });
  }
}


// Deletar vaga
export async function deletarVaga(req, res) {
  const { id } = req.query

  if (!id) return res.status(400).json({ error: 'ID da vaga não informado' })

  try {
    const db = await connect()
    const [result] = await db.execute('DELETE FROM vagas WHERE vagas_id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vaga não encontrada para deletar' })
    }

    res.status(200).json({ message: 'Vaga deletada com sucesso' })
  } catch (err) {
    console.error('Erro ao excluir vaga:', err)
    res.status(500).json({ error: 'Erro ao deletar vaga', detail: err.message })
  }
}
