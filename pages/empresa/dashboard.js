'use client'

import { useEffect, useState } from 'react'
import { getCookie, deleteCookie } from 'cookies-next'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import EstrelasCaindo from '../../src/components/estrelas/Estrelas'
import Header from '../../src/components/Header/Header'
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
      } catch {
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
      if (!res.ok) return console.error('Erro ao buscar vagas:', await res.text())
      const data = await res.json()
      setVagas(data)
    } catch (err) {
      console.error('Erro ao buscar vagas:', err)
    }
  }

  const fetchInscritos = async (vagaId) => {
    if (!vagaId) {
      console.warn('vagaId não fornecido.')
      return
    }

    try {
      const res = await fetch(`/api/candidatura?vagas_id=${vagaId}`)

      if (!res.ok) {
        console.error(`Erro ao buscar inscritos da vaga ${vagaId}:`, res.status)
        return
      }

      const data = await res.json()

      if (!Array.isArray(data)) {
        console.error('Resposta inesperada ao buscar inscritos:', data)
        return
      }

      setInscritos((prev) => ({ ...prev, [vagaId]: data }))
    } catch (err) {
      console.error('Erro ao buscar inscritos:', err.message || err)
    }
  }


  const handleChange = (e, field) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!empresa || !empresa.id) {
      return alert('Empresa não autenticada.')
    }

    const salarioConvertido = parseFloat(form.salario)
    if (isNaN(salarioConvertido)) {
      return alert('Salário precisa ser um número válido')
    }

    const camposParaVerificar = { ...form, id_empresa: empresa.id }
    const algumVazio = Object.values(camposParaVerificar).some(val =>
      typeof val === 'string' && val.trim() === ''
    )
    if (algumVazio) {
      return alert('Preencha todos os campos obrigatórios')
    }

    const url = editandoId ? `/api/vagas?id=${editandoId}` : '/api/vagas'
    const method = editandoId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, salario: salarioConvertido, id_empresa: empresa.id })
      })

      if (!res.ok) {
        return alert(`Erro ao salvar vaga: ${await res.text()}`)
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
    } catch {
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
    setForm({ ...vaga })
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
    window.location.href = 'http://localhost:3000/home';
  }

  if (!empresa) return <p className="text-white">Carregando...</p>

  return (

    <><Header></Header>
      <div className="container py-5 text-white mt-5 Formulario" >
        <EstrelasCaindo />

        <div className="row align-items-start mb-5" style={{marginTop: '30rem'}}>
          <motion.div
            className="col-md-6 d-flex justify-content-center"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img src="/Astronautas/AstronautaEditar.png" alt="editar" style={{ width: '25rem', height: 'auto' }} />
          </motion.div>

          <motion.div
            className="col-md-6"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-dark text-white mb-3 p-4 rounded">
              <h1 className="FormularioTitulo mb-3">{editandoId ? 'Editar vaga' : 'Criar nova vaga'}</h1>
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
                    {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
                      .map(uf => <option key={uf} value={uf}>{uf}</option>)}
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
                  <button type="submit" className="btn btn col-md-6" style={{ backgroundColor: '#148a9d' }}>
                    {editandoId ? 'Atualizar Vaga' : 'Criar Vaga'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        <h2 className="mb-4">Minhas Vagas</h2>
        {vagas.length === 0 ? (
          <p>Nenhuma vaga cadastrada.</p>
        ) : (
          <div className="row">
            {vagas.map((vaga, index) => (
              <motion.div
                key={vaga.vagas_id}
                className="col-md-4 mb-4"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <div className="card bg-dark text-white p-3 h-100">
                  <h4>{vaga.titulo}</h4>
                  <p><strong>Área:</strong> {vaga.area}</p>
                  <p><strong>Tipo:</strong> {vaga.tipoDeVaga}</p>
                  <p><strong>Salário:</strong> R$ {parseFloat(vaga.salario).toFixed(2)}</p>
                  <p><strong>Estado:</strong> {vaga.estado}</p>
                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-warning btn-sm" onClick={() => handleEdit(vaga)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(vaga.vagas_id)}>Excluir</button>
                    <button style={{ backgroundColor: '#148a9d' }} className="btn btn-sm" onClick={() => toggleVerInscritos(vaga.vagas_id)}>
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
                              <strong>{aluno.nome_aluno}</strong> - {aluno.email} <br />
                              {aluno.curriculo ? (
                                <a
                                  href={`http://localhost:3001${aluno.curriculo}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#00d9ff' }}
                                >
                                  Ver Currículo
                                </a>
                              ) : (
                                <span style={{ color: 'gray' }}>Sem currículo enviado</span>
                              )}
                            </li>
                          ))}
                        </ul>

                      ) : (
                        <p>Nenhum inscrito ainda.</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
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
    </>
  )
}
