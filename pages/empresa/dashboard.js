import { useEffect, useState } from 'react'
import { getCookie, deleteCookie } from 'cookies-next'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/router'

export default function DashboardEmpresa() {
  const [empresa, setEmpresa] = useState(null)
  const [vagas, setVagas] = useState([])
  const [form, setForm] = useState({
    titulo: '',
    tipoDeVaga: '',
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
  
    const camposParaVerificar = {
      ...form,
      id_empresa: empresa.id
    }
  
    const camposObrigatorios = Object.entries(camposParaVerificar)
    const algumVazio = camposObrigatorios.some(([_, valor]) =>
      typeof valor === 'string' ? valor.trim() === '' : valor === null || valor === undefined
    )
  
    if (algumVazio) {
      return alert('Preencha todos os campos obrigatórios')
    }
  
    // Define URL e método baseado se está editando ou criando
    const url = editandoId ? `/api/vagas/${editandoId}` : '/api/vagas'
    const method = editandoId ? 'PUT' : 'POST'
  
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tipo_vaga: form.tipoDeVaga, // garantir compatibilidade com o banco
          salario: parseFloat(form.salario),
          id_empresa: empresa.id
        })
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        console.error(data)
        return alert(data.error || 'Erro ao salvar vaga')
      }
  
      // Resetar formulário
      setForm({
        titulo: '',
        tipoDeVaga: '',
        descricao: '',
        area: '',
        salario: '',
        endereco: '',
        estado: '',
        atividades: '',
        requisitos: '',
        horario: ''
      })
  
      setEditandoId(null)
      fetchVagas(empresa.id)
    } catch (err) {
      console.error(err)
      alert('Erro inesperado ao salvar vaga')
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
      titulo: vaga.titulo || '',
      tipoDeVaga: vaga.tipoDeVaga || '',
      descricao: vaga.descricao || '',
      area: vaga.area || '',
      salario: vaga.salario || '',
      endereco: vaga.endereco || '',
      estado: vaga.estado || '',
      atividades: vaga.atividades || '',
      requisitos: vaga.requisitos || '',
      horario: vaga.horario || ''
    });
    setEditandoId(vaga.vagas_id);
  }
  

  const handleLogout = () => {
    deleteCookie('authorization')
    router.push('/login')
  }

  if (!empresa) return <p>Carregando...</p>

  const thStyle = {
    borderBottom: '2px solid #ccc',
    padding: '8px',
    textAlign: 'left',
    backgroundColor: '#333',
    color: 'white'
  }
  
  const tdStyle = {
    borderBottom: '1px solid #444',
    padding: '8px',
    color: 'white'
  }
  
  const buttonStyle = {
    padding: '4px 10px',
    backgroundColor: '#555',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
  

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>Bem-vindo, {empresa.email}</h1>
      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>Sair</button>

      <h2>{editandoId ? 'Editar Vaga' : 'Criar Nova Vaga'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <select value={form.tipoDeVaga} onChange={(e) => handleChange(e, 'tipoDeVaga')} required>
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

        <select value={form.estado} onChange={(e) => handleChange(e, 'estado')} required>
          <option value="">Selecione o estado</option>
          <option value="AC">AC - Acre</option>
          <option value="AL">AL - Alagoas</option>
          <option value="AP">AP - Amapá</option>
          <option value="AM">AM - Amazonas</option>
          <option value="BA">BA - Bahia</option>
          <option value="CE">CE - Ceará</option>
          <option value="DF">DF - Distrito Federal</option>
          <option value="ES">ES - Espírito Santo</option>
          <option value="GO">GO - Goiás</option>
          <option value="MA">MA - Maranhão</option>
          <option value="MT">MT - Mato Grosso</option>
          <option value="MS">MS - Mato Grosso do Sul</option>
          <option value="MG">MG - Minas Gerais</option>
          <option value="PA">PA - Pará</option>
          <option value="PB">PB - Paraíba</option>
          <option value="PR">PR - Paraná</option>
          <option value="PE">PE - Pernambuco</option>
          <option value="PI">PI - Piauí</option>
          <option value="RJ">RJ - Rio de Janeiro</option>
          <option value="RN">RN - Rio Grande do Norte</option>
          <option value="RS">RS - Rio Grande do Sul</option>
          <option value="RO">RO - Rondônia</option>
          <option value="RR">RR - Roraima</option>
          <option value="SC">SC - Santa Catarina</option>
          <option value="SP">SP - São Paulo</option>
          <option value="SE">SE - Sergipe</option>
          <option value="TO">TO - Tocantins</option>
        </select>

        <input placeholder="Titulo da Vaga" value={form.titulo} onChange={(e) => handleChange(e, 'titulo')} required />
        <input placeholder="Descrição da Vaga" value={form.descricao} onChange={(e) => handleChange(e, 'descricao')} required />
        <input placeholder="Salário em R$" value={form.salario} onChange={(e) => handleChange(e, 'salario')} required />
        <input placeholder="Endereço" value={form.endereco} onChange={(e) => handleChange(e, 'endereco')} required />
        <input placeholder="Atividades" value={form.atividades} onChange={(e) => handleChange(e, 'atividades')} required />
        <input placeholder="Requisitos" value={form.requisitos} onChange={(e) => handleChange(e, 'requisitos')} required />
        <input placeholder="Carga Horária" value={form.horario} onChange={(e) => handleChange(e, 'horario')} required />
        <button type="submit">{editandoId ? 'Atualizar' : 'Criar'}</button>
      </form>

      <h2>Minhas Vagas</h2>
{Array.isArray(vagas) && vagas.length > 0 ? (
  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
    <thead>
      <tr>
        <th style={thStyle}>Título</th>
        <th style={thStyle}>Área</th>
        <th style={thStyle}>Tipo</th>
        <th style={thStyle}>Salário</th>
        <th style={thStyle}>Estado</th>
        <th style={thStyle}>Ações</th>
      </tr>
    </thead>
    <tbody>
      {vagas.map((vaga) => (
        <tr key={vaga.vagas_id}>
          <td style={tdStyle}>{vaga.titulo || '(Sem título)'}</td>
          <td style={tdStyle}>{vaga.area}</td>
          <td style={tdStyle}>{vaga.tipoDeVaga}</td>
          <td style={tdStyle}>R$ {parseFloat(vaga.salario).toFixed(2)}</td>
          <td style={tdStyle}>{vaga.estado}</td>
          <td style={tdStyle}>
            <button onClick={() => handleEdit(vaga)} style={buttonStyle}>Editar</button>
            <button onClick={() => handleDelete(vaga.vagas_id)} style={{ ...buttonStyle, marginLeft: '0.5rem', backgroundColor: '#dc3545' }}>
              Excluir
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
) : (
  <p>Nenhuma vaga cadastrada.</p>
)} </div> ) }
