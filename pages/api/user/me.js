import jwt from 'jsonwebtoken'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: 'Método não permitido' })
  }

  const authHeader = req.headers.authorization
  const cookieToken = req.cookies?.authorization

  // Captura o token do header ou cookie (prioridade para header)
  let token = null
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (typeof cookieToken === 'string') {
    token = cookieToken
  }

  if (!token || typeof token !== 'string') {
    return res.status(401).json({ message: 'Token não fornecido ou inválido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto')
    return res.status(200).json(decoded)
  } catch (err) {
    console.error('Erro ao verificar token:', err)
    return res.status(403).json({ message: 'Token inválido ou expirado' })
  }
}
