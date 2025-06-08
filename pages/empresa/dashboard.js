'use client'
import { useEffect, useState } from 'react'
import { getCookie, deleteCookie } from 'cookies-next'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/router'
import "bootstrap/dist/css/bootstrap.min.css"

export default function DashboardEmpresa() {
  const [empresa, setEmpresa] = useState(null)
  const [vagas, setVagas] = useState([])
  const [inscritos, setInscritos] = useState({})
  const [verInscritosId, setVerInscritosId] = useState(null)
  const [vagaParaExcluir, setVagaParaExcluir] = useState(null)

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
    const verificarToken = async () => {
      const token = getCookie('authorization')
      if (!token) return router.push('/login')

      try {
        const decoded = jwtDecode(token)
        if (decoded.tipo !== 'empresa') return router.push('/login')
        setEmpresa(decoded)
        await fetchVagas(decoded.id)
      } catch (err) {
        router.push('/login')
      }
    }

    verificarToken()
  }, [])

  useEffect(() => {
    document.body.style.backgroundColor = 'black'
    document.body.style.margin = '0'
    document.body.style.overflowX = 'hidden'
  }, [])

  const fetchVagas = async (id_empresa) => {
    try {
      const res = await fetch(`/api/vagas?id_empresa=${id_empresa}`)
      if (!res.ok) {
        const text = await res.text()
        console.error('Erro ao buscar vagas:', text)
        return
      }
      const data = await res.json()
      setVagas(data)
    } catch (err) {
      console.error('Erro ao buscar vagas:', err)
    }
  }

  const fetchInscritos = async (vagaId) => {
    try {
      const res = await fetch(`/api/candidatura?vaga_id=${vagaId}`)
      if (!res.ok) return
      const data = await res.json()
      setInscritos((prev) => ({ ...prev, [vagaId]: data }))
    } catch (err) {
      console.error('Erro ao buscar inscritos:', err)
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

    const algumVazio = Object.entries(camposParaVerificar).some(([key, val]) => {
      if (typeof val === 'number') return false
      return !val || val.trim?.() === ''
    })

    if (algumVazio) return alert('Preencha todos os campos obrigatórios')

    // 🔁 Agora usa query string em vez de /:id
    const url = editandoId ? `/api/vagas?id=${editandoId}` : '/api/vagas'
    const method = editandoId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          salario: parseFloat(form.salario),
          id_empresa: empresa.id
        })
      })

      if (!res.ok) {
        const erro = await res.text()
        return alert(`Erro ao salvar vaga: ${erro}`)
      }

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
      alert('Erro inesperado ao salvar vaga')
    }
  }

  const handleDelete = (id) => setVagaParaExcluir(id)

  const confirmarExcluirVaga = async () => {
    try {
 
      const res = await fetch(`/api/vagas?id=${vagaParaExcluir}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir vaga')
      setVagaParaExcluir(null)
      fetchVagas(empresa.id)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEdit = (vaga) => {
    setForm({
      titulo: vaga.titulo,
      tipoDeVaga: vaga.tipoDeVaga,
      descricao: vaga.descricao,
      area: vaga.area,
      salario: vaga.salario,
      endereco: vaga.endereco,
      estado: vaga.estado,
      atividades: vaga.atividades,
      requisitos: vaga.requisitos,
      horario: vaga.horario
    })
    setEditandoId(vaga.vagas_id)
  }

  const toggleVerInscritos = async (vagaId) => {
    if (verInscritosId === vagaId) {
      setVerInscritosId(null)
    } else {
      await fetchInscritos(vagaId)
      setVerInscritosId(vagaId)
    }
  }

  const handleLogout = () => {
    deleteCookie('authorization')
    router.push('/login')
  }

  if (!empresa) return <p className="text-white">Carregando...</p>

  return (
    <div className="container py-5 text-white Formulario">
      <h1 className="FormularioTitulo h1">Bem-vindo, {empresa.nome}</h1>
      <button className="btn btn-danger mb-4" onClick={handleLogout}>Sair</button>

      <div className="bg-white text-dark p-4 rounded mb-5">
        <h1 className="FormularioTitulo">{editandoId ? 'Editar Vaga' : 'Criar Nova Vaga'}</h1>
        <form onSubmit={handleSubmit} className="Form row g-3">
          <div className="col-md-6">
            <select className="form-control" value={form.tipoDeVaga} onChange={(e) => handleChange(e, 'tipoDeVaga')} required>
              <option value="">Tipo da vaga</option>
              <option value="Estágio">Estágio</option>
              <option value="Aprendiz">Aprendiz</option>
              <option value="CLT">CLT</option>
            </select>
          </div>

          <div className="col-md-6">
            <select className="form-control" value={form.area} onChange={(e) => handleChange(e, 'area')} required>
              <option value="">Área</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Enfermagem">Enfermagem</option>
              <option value="Engenharia">Engenharia</option>
              <option value="Administração">Administração</option>
            </select>
          </div>

          <div className="col-md-6">
            <select className="form-control" value={form.estado} onChange={(e) => handleChange(e, 'estado')} required>
              <option value="">Estado</option>
              {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>

          {['titulo', 'descricao', 'salario', 'endereco', 'atividades', 'requisitos', 'horario'].map((campo, i) => (
            <div className="col-md-6" key={i}>
              <input
                type="text"
                placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                className="form-control"
                value={form[campo]}
                onChange={(e) => handleChange(e, campo)}
                required
              />
            </div>
          ))}

          <div className="col-md-6 BotaoEnviar">
            <button type="submit" className="btn btn-primary">
              {editandoId ? 'Atualizar Vaga' : 'Criar Vaga'}
            </button>
          </div>
        </form>
      </div>

      <h2 className="mb-4">Minhas Vagas</h2>
      {vagas.length === 0 ? (
        <p>Nenhuma vaga cadastrada.</p>
      ) : (
        vagas.map((vaga) => (
          <div key={vaga.vagas_id} className="card bg-secondary mb-4 p-3">
            <h4>{vaga.titulo}</h4>
            <p><strong>Área:</strong> {vaga.area}</p>
            <p><strong>Tipo:</strong> {vaga.tipoDeVaga}</p>
            <p><strong>Salário:</strong> R$ {parseFloat(vaga.salario).toFixed(2)}</p>
            <p><strong>Estado:</strong> {vaga.estado}</p>
            <div className="d-flex gap-2">
              <button className="btn btn-warning btn-sm" onClick={() => handleEdit(vaga)}>Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vaga.vagas_id)}>Excluir</button>
              <button className="btn btn-info btn-sm" onClick={() => toggleVerInscritos(vaga.vagas_id)}>
                {verInscritosId === vaga.vagas_id ? 'Ocultar' : 'Ver Inscritos'}
              </button>
            </div>

            {verInscritosId === vaga.vagas_id && (
              <div className="mt-3">
                <h6>Inscritos:</h6>
                {inscritos[vaga.vagas_id]?.length > 0 ? (
                  <ul>
                    {inscritos[vaga.vagas_id].map((aluno, index) => (
                      <li key={index}>
                        <strong>{aluno.nome}</strong> - {aluno.email} - {aluno.telefone}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhum inscrito ainda.</p>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {vagaParaExcluir && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Deseja excluir essa vaga?</h5>
                <button className="btn-close" onClick={() => setVagaParaExcluir(null)}></button>
              </div>
              <div className="modal-body">
                <p>Essa ação não poderá ser desfeita.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setVagaParaExcluir(null)}>Cancelar</button>
                <button className="btn btn-danger" onClick={confirmarExcluirVaga}>Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
