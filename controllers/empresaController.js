import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { connect } from '../config/db.js'

const SECRET = process.env.JWT_SECRET || 'secreto'

// Gerar token com tipo empresa
function generateToken(empresa) {
  return jwt.sign(
    { id: empresa.id, email: empresa.email_empresa, tipo: 'empresa' },
    SECRET,
    { expiresIn: '1h' }
  )
}

// Cadastro da empresa
export async function cadastroEmpresa(req, res) {
  const { nome_empresa, endereco_empresa, email_empresa, senha } = req.body

  if (!nome_empresa || !endereco_empresa || !email_empresa || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos' })
  }

  try {
    const db = await connect()
    const [existe] = await db.execute('SELECT * FROM empresa WHERE email_empresa = ?', [email_empresa])
    if (existe.length > 0) return res.status(400).json('empresa_ja_cadastrada')

    const senhaCriptografada = await bcrypt.hash(senha, 10)

    await db.execute(
      'INSERT INTO empresa (nome_empresa, endereco_empresa, email_empresa, senha) VALUES (?, ?, ?, ?)',
      [nome_empresa, endereco_empresa, email_empresa, senhaCriptografada]
    )

    const [novaEmpresa] = await db.execute('SELECT * FROM empresa WHERE email_empresa = ?', [email_empresa])
    const token = generateToken(novaEmpresa[0])

    res.status(200).json(token)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro no servidor', detail: err.message })
  }
}

// Login da empresa
export async function loginEmpresa(req, res) {
  const { email_empresa, senha } = req.body

  if (!email_empresa || !senha) return res.status(400).json({ error: 'Email e senha obrigatórios' })

  try {
    const db = await connect()
    const [empresas] = await db.execute('SELECT * FROM empresa WHERE email_empresa = ?', [email_empresa])
    const empresa = empresas[0]

    if (!empresa) return res.status(400).json('empresa_nao_encontrada')

    const senhaCorreta = await bcrypt.compare(senha, empresa.senha)
    if (!senhaCorreta) return res.status(400).json('senha_incorreta')

    const token = generateToken(empresa)
    res.status(200).json(token)
  } catch (err) {
    res.status(500).json({ error: 'Erro interno', detail: err.message })
  }
}
