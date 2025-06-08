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


// Listar todas as vagas ou vagas por empresa
export async function listarVagas(req, res) {
  const { id_empresa } = req.query;

  try {
    const db = await connect();

    let query = 'SELECT * FROM vagas';
    let params = [];

    // Se tiver id_empresa, filtra por empresa
    if (id_empresa) {
      query += ' WHERE id_empresa = ?';
      params.push(id_empresa);
    }

    query += ' ORDER BY vagas_id DESC';

    const [vagas] = await db.execute(query, params);
    res.status(200).json(vagas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar vagas', detail: err.message });
  }
}



// Buscar vaga por ID
export async function buscarVagaPorId(req, res) {
  const { id } = req.query;

  try {
    const db = await connect();
    const [rows] = await db.execute('SELECT * FROM vagas WHERE vagas_id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vaga não encontrada' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Erro ao buscar vaga:', err);
    res.status(500).json({ error: 'Erro ao buscar vaga' });
  }
}

// Editar vaga
export async function atualizarVaga(req, res) {
  const { id } = req.query;
    console.log('Editando vaga com id:', id);
  const {
    titulo,
    tipoDeVaga,
    descricao,
    area,
    salario,
    endereco,
    estado,
    atividades,
    requisitos,
    horario
  } = req.body;

  try {
    const db = await connect();
    const [result] = await db.execute(
      `UPDATE vagas SET 
        titulo = ?, tipoDeVaga = ?, descricao = ?, area = ?, 
        salario = ?, endereco = ?, estado = ?, 
        atividades = ?, requisitos = ?, horario = ?
       WHERE vagas_id = ?`,
      [titulo, tipoDeVaga, descricao, area, salario, endereco, estado, atividades, requisitos, horario, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vaga não encontrada' });
    }

    res.status(200).json({ message: 'Vaga atualizada com sucesso' });
  } catch (err) {
    console.error('Erro ao editar vaga:', err);
    res.status(500).json({ error: 'Erro ao editar vaga' });
  }
}


// Deletar vaga
export async function deletarVaga(req, res) {
  const { id } = req.query;

  try {
    const db = await connect();
    const [result] = await db.execute('DELETE FROM vagas WHERE vagas_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vaga não encontrada' });
    }

    res.status(200).json({ message: 'Vaga excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir vaga:', err);
    res.status(500).json({ error: 'Erro ao excluir vaga' });
  }
}
