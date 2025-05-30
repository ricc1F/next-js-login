import { useEffect, useState } from 'react'
import { getCookie, deleteCookie } from 'cookies-next'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/router'

export default function DashboardEmpresa() {
  const [empresa, setEmpresa] = useState(null)
  const [vagas, setVagas] = useState([])
  const [form, setForm] = useState({ tipo_vaga: '', descricao: '' })
  const [editandoId, setEditandoId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const token = getCookie('authorization')
    if (!token) return router.push('/login')

    try {
      const decoded = jwtDecode(token)
      if (decoded.tipo !== 'empresa') return router.push('/login')
      setEmpresa(decoded)
      fetchVagas(decoded.id)
    } catch (err) {
      router.push('/login')
    }
  }, [])

  const fetchVagas = async (id_empresa) => {
    try {
      const res = await fetch(`/api/vagas?id_empresa=${id_empresa}`)
      const data = await res.json()
      setVagas(data)
    } catch (err) {
      console.error('Erro ao buscar vagas:', err)
    }
  }

  const handleChange = (e, field) => {
    setForm({ ...form, [field]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.tipo_vaga) return alert('Preencha o tipo da vaga')

    const url = editandoId ? `/api/vagas/${editandoId}` : '/api/vagas'
    const method = editandoId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id_empresa: empresa.id })
      })

      if (!res.ok) throw new Error('Erro ao salvar vaga')
      setForm({ tipo_vaga: '', descricao: '' })
      setEditandoId(null)
      fetchVagas(empresa.id)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga?')) return

    try {
      const res = await fetch(`/api/vagas/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir vaga')
      fetchVagas(empresa.id)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEdit = (vaga) => {
    setForm({ tipo_vaga: vaga.tipo_vaga, descricao: vaga.descricao || '' })
    setEditandoId(vaga.vagas_id) // Aqui estava o erro
  }

  const handleLogout = () => {
    deleteCookie('authorization')
    router.push('/login')
  }

  if (!empresa) return <p>Carregando...</p>

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>Bem-vindo, {empresa.email}</h1>
      <button
        onClick={handleLogout}
        style={{
          marginBottom: '1rem',
          padding: '8px 16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Sair
      </button>

      <h2>{editandoId ? 'Editar Vaga' : 'Criar Nova Vaga'}</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          placeholder="Tipo da vaga"
          value={form.tipo_vaga}
          onChange={(e) => handleChange(e, 'tipo_vaga')}
          style={{ padding: '8px', marginRight: '8px', width: '200px' }}
        />
        <input
          placeholder="Descrição (opcional)"
          value={form.descricao}
          onChange={(e) => handleChange(e, 'descricao')}
          style={{ padding: '8px', marginRight: '8px', width: '300px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>
          {editandoId ? 'Atualizar' : 'Criar'}
        </button>
      </form>

      <h2>Minhas Vagas</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {vagas.length === 0 && <li>Nenhuma vaga cadastrada.</li>}
        {vagas.map((vaga) => (
          <li key={vaga.vagas_id} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <strong>{vaga.tipo_vaga}</strong><br />
            {vaga.descricao && <em>{vaga.descricao}</em>}<br />
            <button onClick={() => handleEdit(vaga)} style={{ marginRight: '10px' }}>Editar</button>
            <button onClick={() => handleDelete(vaga.vagas_id)} style={{ backgroundColor: '#dc3545', color: 'white' }}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
