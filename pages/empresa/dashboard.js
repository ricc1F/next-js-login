import { useEffect, useState } from 'react'
import { getCookie, deleteCookie } from 'cookies-next'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/router'

export default function DashboardEmpresa() {
  const [empresa, setEmpresa] = useState(null)
  const [vagas, setVagas] = useState([])
  const [form, setForm] = useState({
    tipo_vaga: '',
    descricao: '',
    area: '',
    salario: '',
    endereco: '',
    estado: '',
    atividades: '',
    requisitos: '',
    horario: ''
  })
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

    const camposObrigatorios = Object.entries(form)
    const algumVazio = camposObrigatorios.some(([_, valor]) => !valor)

    if (algumVazio) return alert('Preencha todos os campos obrigatórios')

    try {
      const res = await fetch('/api/vagas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          salario: parseFloat(form.salario),
          id_empresa: empresa.id
        })
      })

      const data = await res.json()

      if (!res.ok) {
        console.error(data)
        return alert(data.error || 'Erro ao criar vaga')
      }

      setForm({
        tipo_vaga: '',
        descricao: '',
        area: '',
        salario: '',
        endereco: '',
        estado: '',
        atividades: '',
        requisitos: '',
        horario: '',
      })
      fetchVagas(empresa.id)
    } catch (err) {
      console.error(err)
      alert('Erro inesperado ao criar vaga')
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
    setForm({
      tipo_vaga: vaga.tipo_vaga || '',
      descricao: vaga.descricao || '',
      area: vaga.area || '',
      salario: vaga.salario || '',
      endereco: vaga.endereco || '',
      estado: vaga.estado || '',
      atividades: vaga.atividades || '',
      requisitos: vaga.requisitos || '',
      horario: vaga.horario || '',
    })
    setEditandoId(vaga.vagas_id)
  }

  const handleLogout = () => {
    deleteCookie('authorization')
    router.push('/login')
  }

  if (!empresa) return <p>Carregando...</p>

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>Bem-vindo, {empresa.email}</h1>
      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>Sair</button>

      <h2>{editandoId ? 'Editar Vaga' : 'Criar Nova Vaga'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <select value={form.tipo_vaga} onChange={(e) => handleChange(e, 'tipo_vaga')} required>
          <option value="">Tipo da vaga</option>
          <option value="Estágio">Estágio</option>
          <option value="Aprendiz">Aprendiz</option>
          <option value="CLT">CLT</option>
        </select>

        <select value={form.area} onChange={(e) => handleChange(e, 'area')} required>
          <option value="">Área</option>
          <option value="Tecnologia">Tecnologia</option>
          <option value="Enfermagem">Enfermagem</option>
          <option value="Engenharia">Engenharia</option>
          <option value="Administração">Administração</option>
        </select>

        <input placeholder="Descrição" value={form.descricao} onChange={(e) => handleChange(e, 'descricao')} required />
        <input placeholder="Salário" value={form.salario} onChange={(e) => handleChange(e, 'salario')} required />
        <input placeholder="Endereço" value={form.endereco} onChange={(e) => handleChange(e, 'endereco')} required />
        <input placeholder="Estado" value={form.estado} onChange={(e) => handleChange(e, 'estado')} required />
        <input placeholder="Atividades" value={form.atividades} onChange={(e) => handleChange(e, 'atividades')} required />
        <input placeholder="Requisitos" value={form.requisitos} onChange={(e) => handleChange(e, 'requisitos')} required />
        <input placeholder="Horário" value={form.horario} onChange={(e) => handleChange(e, 'horario')} required />
        <button type="submit">{editandoId ? 'Atualizar' : 'Criar'}</button>
      </form>

      <h2>Minhas Vagas</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {vagas.length === 0 && <li>Nenhuma vaga cadastrada.</li>}
        {vagas.map((vaga) => (
          <li key={vaga.vagas_id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
            <strong>{vaga.tipo_vaga}</strong><br />
            <em>{vaga.descricao}</em><br />
            <button onClick={() => handleEdit(vaga)}>Editar</button>
            <button onClick={() => handleDelete(vaga.vagas_id)} style={{ marginLeft: '1rem' }}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
