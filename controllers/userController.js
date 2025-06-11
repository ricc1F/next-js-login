import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { connect } from '../config/db.js'

const SECRET = process.env.JWT_SECRET || 'secreto'

// Gera token JWT
function generateToken(user, tipo) {
  const payload = {
    id: tipo === 'aluno' ? user.id_aluno : user.id,
    email: tipo === 'aluno' ? user.email : user.email_empresa,
    tipo,
    nome: tipo === 'aluno' ? user.nome_aluno : user.nome_empresa
  }

  if (tipo === 'aluno') {
    payload.matricula = user.matricula
  }

  return jwt.sign(payload, SECRET, { expiresIn: '1h' })
}


// Login
export async function login(req, res) {
  try {
    const { email, senha, tipo_usuario } = req.body
    if (!email || !senha || !tipo_usuario) return res.status(400).json({ error: 'Campos obrigatórios ausentes' })

    const db = await connect()
    const tabela = tipo_usuario === 'aluno' ? 'aluno' : 'empresa'
    const campoEmail = tipo_usuario === 'aluno' ? 'email' : 'email_empresa'

    const [userResult] = await db.execute(`SELECT * FROM ${tabela} WHERE ${campoEmail} = ?`, [email])
    const user = userResult[0]

    if (!user) return res.status(400).json('usuario_nao_encontrado')

    const senhaValida = await bcrypt.compare(senha, user.senha)
    if (!senhaValida) return res.status(400).json('senha_incorreta')

    const token = generateToken(user, tipo_usuario)
    res.status(200).json(token)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno no servidor' })
  }
}

// Cadastro
export async function cadastro(req, res) {
  try {
    const db = await connect()
    const { tipo_usuario } = req.body

    // Cadastro de aluno
    if (tipo_usuario === 'aluno') {
      const { nome_aluno, email, senha, idade, endereco_aluno, nome_escola } = req.body

      if (!nome_aluno || !email || !senha || !idade || !endereco_aluno || !nome_escola) {
        return res.status(400).json({ error: 'Todos os campos do aluno são obrigatórios' })
      }

      const [userExist] = await db.execute('SELECT * FROM aluno WHERE email = ?', [email])
      if (userExist.length > 0) return res.status(400).json('Usuário já cadastrado')

      const senhaHash = await bcrypt.hash(senha, 10)

      await db.execute(
        'INSERT INTO aluno (nome_aluno, email, senha, idade, endereco_aluno, nome_escola) VALUES (?, ?, ?, ?, ?, ?)',
        [nome_aluno, email, senhaHash, idade, endereco_aluno, nome_escola]
      )

      const [novo] = await db.execute('SELECT * FROM aluno WHERE email = ?', [email])
      const token = generateToken(novo[0], 'aluno')
      return res.status(200).json(token)

    // Cadastro de empresa
    } else if (tipo_usuario === 'empresa') {
      const { nome_empresa, email_empresa, senha, endereco_empresa, cnpj } = req.body

      if (!nome_empresa || !email_empresa || !senha || !endereco_empresa || !cnpj) {
        return res.status(400).json({ error: 'Todos os campos da empresa são obrigatórios' })
      }

      const [empresaExist] = await db.execute(
        'SELECT * FROM empresa WHERE email_empresa = ? OR cnpj = ?',
        [email_empresa, cnpj]
      )
      if (empresaExist.length > 0) return res.status(400).json('Empresa já cadastrada')

      const senhaHash = await bcrypt.hash(senha, 10)

      await db.execute(
        'INSERT INTO empresa (nome_empresa, email_empresa, senha, endereco_empresa, cnpj) VALUES (?, ?, ?, ?, ?)',
        [nome_empresa, email_empresa, senhaHash, endereco_empresa, cnpj]
      )

      const [nova] = await db.execute('SELECT * FROM empresa WHERE email_empresa = ?', [email_empresa])
      const token = generateToken(nova[0], 'empresa')
      return res.status(200).json(token)
    }

    res.status(400).json({ error: 'tipo_usuario inválido' })
  } catch (err) {
    console.error('Erro ao cadastrar:', err)
    res.status(500).json(err.message)
  }
}


