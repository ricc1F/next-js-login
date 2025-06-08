// Listar todas as vagas públicas (para exibir na home)

export async function listarTodasAsVagas(req, res) {
  try {
    const db = await connect();
    const [vagas] = await db.execute(
      `SELECT * FROM vagas ORDER BY vagas_id DESC`
    );

    res.status(200).json(vagas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar vagas públicas', detail: err.message });
  }
}
