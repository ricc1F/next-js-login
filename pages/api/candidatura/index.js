import { connect } from '../../../config/db'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { matricula, vagas_id } = req.body

    if (!matricula || !vagas_id) {
      return res.status(400).json({ error: 'Dados incompletos' })
    }

    try {
      const db = await connect()

      // Verifica se já existe
      const [existe] = await db.execute(
        'SELECT * FROM candidaturas WHERE matricula = ? AND vagas_id = ?',
        [matricula, vagas_id]
      )

      if (existe.length > 0) {
        return res.status(400).json({ error: 'Você já se candidatou a esta vaga' })
      }

      // Insere candidatura com status pendente
      await db.execute(
        'INSERT INTO candidaturas (matricula, vagas_id) VALUES (?, ?)',
        [matricula, vagas_id]
      )

      // Dispara roleta automática em 1 minuto
      setTimeout(async () => {
        const resultado = Math.random() < 0.5 ? 'aprovado' : 'reprovado'
        await db.execute(
          'UPDATE candidaturas SET status = ? WHERE matricula = ? AND vagas_id = ?',
          [resultado, matricula, vagas_id]
        )
        console.log(`Resultado da candidatura definido: ${resultado}`)
      }, 60000)

      return res.status(201).json({ message: 'Parabéns você passou nos requisitos da vaga, entraremos em contato assim que possivel!' })
    } catch (err) {
      return res.status(500).json({ error: 'Poxa, infelizmente você não foi selecionado para a vaga, mas não desista, Boa Sorte!', detail: err.message })
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido' })
  }
}
