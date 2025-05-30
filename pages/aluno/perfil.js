import { useEffect, useState } from 'react'
import { getCookie, deleteCookie } from 'cookies-next'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/router'

export default function PerfilAluno() {
  const [usuario, setUsuario] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = getCookie('authorization')

    if (!token) {
      router.push('/login')
      return
    }

    try {
      const decoded = jwtDecode(token)

      if (decoded.tipo !== 'aluno') {
        router.push('/login')
      } else {
        setUsuario(decoded)
      }
    } catch (err) {
      console.error('Token inválido:', err)
      router.push('/login')
    }
  }, [])

  const handleLogout = () => {
    deleteCookie('authorization')
    router.push('/login')
  }

  if (!usuario) return <p>Carregando...</p>

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bem-vindo, {usuario.email}!</h1>
      <p>Você está autenticado como aluno.</p>

      <button
        onClick={handleLogout}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Sair
      </button>
    </div>
  )
}
