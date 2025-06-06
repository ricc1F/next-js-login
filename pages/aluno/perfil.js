import { useEffect, useState } from 'react'
import { getCookie, deleteCookie } from 'cookies-next'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/router'

export default function PerfilAluno() {
  const [aluno, setAluno] = useState(null)
  const [candidaturas, setCandidaturas] = useState([])
  const router = useRouter()

  useEffect(() => {
    const token = getCookie('authorization')
    if (!token) return router.push('/login')

    try {
      const decoded = jwtDecode(token)
      if (decoded.tipo !== 'aluno') return router.push('/login')
      setAluno(decoded)
      buscarCandidaturas(decoded.id)
    } catch {
      router.push('/login')
    }
  }, [])

  const buscarCandidaturas = async (matricula) => {
    try {
      const res = await fetch(`/api/candidaturas?matricula=${matricula}`)
      const data = await res.json()
      setCandidaturas(data)
    } catch (err) {
      console.error('Erro ao buscar candidaturas:', err)
    }
  }

  const handleLogout = () => {
    deleteCookie('authorization')
    router.push('/login')
  }

  if (!aluno) return <p>Carregando...</p>

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>Bem-vindo, {aluno.email}</h1>
      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>Sair</button>

      <h2>Minhas Candidaturas</h2>
      {candidaturas.length === 0 ? (
        <p>Você ainda não se candidatou a nenhuma vaga.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Área</th>
              <th style={thStyle}>Descrição</th>
              <th style={thStyle}>Empresa</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {candidaturas.map((c) => (
              <tr key={c.vagas_id}>
                <td style={tdStyle}>{c.area}</td>
                <td style={tdStyle}>{c.descricao}</td>
                <td style={tdStyle}>{c.nome_empresa}</td>
                <td style={tdStyle}>
                  {c.status === 'pendente' && '⏳ Aguardando...'}
                  {c.status === 'aprovado' && '✅ Aprovado!'}
                  {c.status === 'reprovado' && '❌ Reprovado'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const thStyle = {
  borderBottom: '1px solid #ccc',
  textAlign: 'left',
  padding: '8px'
}

const tdStyle = {
  borderBottom: '1px solid #eee',
  padding: '8px'
}
