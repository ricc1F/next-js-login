'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCookie, deleteCookie } from 'cookies-next'
import { useUsuarioLogado } from '../hook/useUsuarioLogado'

import "bootstrap/dist/css/bootstrap.min.css"
import EstrelasCaindo from '../../src/components/estrelas/Estrelas'
import styles from './AlunoVagas.module.css'
import CardVagas from '../../src/components/cards/card'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function AlunoVagas() {
  const searchParams = useSearchParams()
  const vagaId = searchParams.get('vagaId')

  const [vagas, setVagas] = useState([])
  const [vaga, setVaga] = useState(null)
  const [relacionadas, setRelacionadas] = useState([])
  const [telefone, setTelefone] = useState('')
  const [curriculo, setCurriculo] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { usuario: aluno, carregando, erro } = useUsuarioLogado()

  useEffect(() => {
    document.body.style.backgroundColor = 'black'
    document.body.style.margin = '0'
    document.body.style.overflowX = 'hidden'
  }, [])

  useEffect(() => {
    async function fetchVagas() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/vagas`)
        const data = await res.json()
        const formatadas = data.map(v => ({
          ...v,
          id: v.vagas_id,
          atividades: v.atividades?.split(',') || [],
          requisitos: v.requisitos?.split(',') || [],
        }))
        setVagas(formatadas)
      } catch (err) {
        console.error(err)
        setMensagem('Erro ao carregar vagas.')
      }
    }
    fetchVagas()
  }, [])

  useEffect(() => {
    if (vagaId && vagas.length > 0) {
      const selecionada = vagas.find(v => v.id.toString() === vagaId)
      setVaga(selecionada)
      const relacionadas = vagas.filter(v => v.area === selecionada?.area && v.id !== selecionada?.id)
      setRelacionadas(relacionadas)
    }
  }, [vagaId, vagas])

  async function handleSubmit(e) {
    e.preventDefault()
    const token = getCookie('authorization')
    if (!token) return setMensagem('Você precisa estar logado.')

    if (!telefone) return setMensagem('Por favor, preencha o telefone.')
    if (!curriculo) return setMensagem('Por favor, envie seu currículo.')

    const formData = new FormData()
    formData.append('vagaId', vaga.id)
    formData.append('telefone', telefone)
    formData.append('curriculo', curriculo)

    try {
      const res = await fetch(`${BACKEND_URL}/api/candidatura`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      if (!res.ok) throw new Error('Erro ao enviar inscrição')

      setTelefone('')
      setCurriculo(null)
      setShowModal(true)
    } catch (err) {
      console.error(err)
      setMensagem('Erro ao enviar inscrição. Tente novamente.')
    }
  }

  const handleLogout = () => {
    deleteCookie('authorization')
    window.location.href = '/home'
  }

  function closeModal() {
    setShowModal(false)
  }
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  return (
    <div className="container mt-4 mb-5">
      <div className={styles.Aluno}>
        <EstrelasCaindo />
        {mounted && !carregando && aluno && (
          <h1>Bem-vindo, {aluno.nome}</h1>

        )}
        <button className="btn btn-danger mb-4 mt-3 col-md-2" onClick={handleLogout}>Sair</button>
        {carregando ? (
          <p className="text-light">Carregando dados do aluno...</p>
        ) : erro ? (
          <p className="text-danger">{erro}</p>
        ) : aluno ? (
          <div className="mb-4 text-white">
            <p><strong>Nome:</strong> {aluno.nome}</p>
            <p><strong>Email:</strong> {aluno.email}</p>
          </div>
        ) : (
          <p className="text-warning">Usuário não autenticado</p>
        )}

        {vaga && (
          <>
            <h2 className="text-start text-white mb-4">Vaga Selecionada</h2>
            <div className="row justify-content-start">
              <div className={`card col-md-8 p-4 mb-4 d-flex ${styles.AlunoCard}`}>
                <h4>{vaga.titulo}</h4>
                <p>{vaga.descricao}</p>
                <p><strong>Área:</strong> {vaga.area}</p>
                <p><strong>Localização:</strong> {vaga.localizacao}</p>
                <p><strong>Horário:</strong> {vaga.horario}</p>
                <p><strong>Salário:</strong> {vaga.salario}</p>
                <h5>Atividades:</h5>
                <ul>{vaga.atividades.map((a, i) => <li key={i}>{a}</li>)}</ul>
                <h5>Requisitos:</h5>
                <ul>{vaga.requisitos.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            </div>
          </>
        )}

        {vaga && aluno && (
          <div className={`card p-3 mb-4 ${styles.Formulario}`}>
            <h2 className={styles.FormularioTitulo}>Se inscreva nesta vaga</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.Form}>
              <label>
                Telefone:
                <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
              </label>

              <label>
                Currículo (PDF ou DOC):
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCurriculo(e.target.files[0])} required />
              </label>

              <div className={styles.BotaoEnviar}>
                <button type="submit" disabled={!telefone || !curriculo}>Inscrever-se</button>
              </div>
            </form>
            {mensagem && <p className="mt-2 text-danger">{mensagem}</p>}
          </div>
        )}

        {vaga && (
          relacionadas.length === 0 ? (
            <h2 className="mt-5 text-white">Desculpe! Não temos vagas relacionadas no momento.</h2>
          ) : (
            <>
              <h2 className="mt-5 text-white">Vagas relacionadas</h2>
              <CardVagas vagas={relacionadas} />
            </>
          )
        )}

        {showModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog" onClick={closeModal}>
            <div className="modal-dialog" role="document" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Inscrição realizada</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <p>Você se inscreveu com sucesso nesta vaga! Boa sorte!</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" onClick={closeModal}>Fechar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
