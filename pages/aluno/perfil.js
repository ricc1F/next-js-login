'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCookie } from 'cookies-next'
import { jwtDecode } from 'jwt-decode'
import "bootstrap/dist/css/bootstrap.min.css";

import styles from './AlunoVagas.module.css'
import CardVagas from '../../src/components/cards/card'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function AlunoVagas() {
  const searchParams = useSearchParams()
  const vagaId = searchParams.get('vagaId')

  const [vagas, setVagas] = useState([])
  const [vaga, setVaga] = useState(null)
  const [relacionadas, setRelacionadas] = useState([])
  const [aluno, setAluno] = useState(null)
  const [telefone, setTelefone] = useState('')
  const [curriculo, setCurriculo] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [showModal, setShowModal] = useState(false)

  // 1. Buscar todas as vagas
  useEffect(() => {
    async function fetchVagas() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/vagas`)
        const data = await res.json()

        const vagasFormatadas = data.map((vaga) => ({
          ...vaga,
          atividades: vaga.atividades?.split(',') || [],
          requisitos: vaga.requisitos?.split(',') || [],
        }))

        setVagas(vagasFormatadas)
      } catch (error) {
        console.error('Erro ao buscar vagas:', error)
        setMensagem('Erro ao carregar vagas.')
      }
    }

    fetchVagas()
  }, [])

  // 2. Encontrar a vaga selecionada e relacionadas
  useEffect(() => {
    if (vagaId && vagas.length > 0) {
      const vagaSelecionada = vagas.find((v) => v.id.toString() === vagaId)
      setVaga(vagaSelecionada)

      const relacionadasFiltradas = vagas.filter(
        (v) => v.area === vagaSelecionada?.area && v.id !== vagaSelecionada?.id
      )
      setRelacionadas(relacionadasFiltradas)
    }
  }, [vagaId, vagas])

  // 3. Buscar dados do aluno autenticado
  useEffect(() => {
    async function fetchAluno() {
      const token = getCookie('authorization')
      if (!token) {
        setMensagem('Usuário não autenticado. Faça login.')
        return
      }

      try {
        const decoded = jwtDecode(token)
        if (decoded.tipo !== 'aluno') {
          setMensagem('Apenas alunos podem acessar esta página.')
          return
        }

        const res = await fetch(`${BACKEND_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error('Não autorizado')

        const data = await res.json()
        setAluno(data)
      } catch (error) {
        console.error(error)
        setMensagem('Erro ao buscar dados do aluno. Faça login novamente.')
      }
    }

    fetchAluno()
  }, [])

  if (!vagaId) return <p>Vaga não encontrada. Volte para a página inicial.</p>
  if (!vaga) return <p>Carregando vaga...</p>

  async function handleSubmit(e) {
    e.preventDefault()
    setMensagem('')

    const token = getCookie('authorization')
    if (!token) {
      setMensagem('Você precisa estar logado para se inscrever.')
      return
    }

    if (!telefone) return setMensagem('Por favor, preencha o telefone.')
    if (!curriculo) return setMensagem('Por favor, envie seu currículo.')

    const formData = new FormData()
    formData.append('vagaId', vaga.id)
    formData.append('telefone', telefone)
    formData.append('curriculo', curriculo)

    try {
      const res = await fetch(`${BACKEND_URL}/api/candidatura`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) throw new Error('Falha ao enviar inscrição')

      setMensagem('')
      setTelefone('')
      setCurriculo(null)
      setShowModal(true)
    } catch (err) {
      console.error(err)
      setMensagem('Erro ao enviar inscrição. Tente novamente.')
    }
  }

  function closeModal() {
    setShowModal(false)
  }

  return (
    <div className={styles.Aluno}>
      <div className="container mt-4 mb-5">
        <h1 className="text-center">Vaga Selecionada</h1>

        <div className="row justify-content-start">
          <div className={`card col-md-6 p-4 mb-4 d-flex ${styles.AlunoCard}`}>
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

        {aluno ? (
          <div className={`card p-3 mb-4 ${styles.Formulario}`}>
            <h1 className={styles.FormularioTitulo}>Se inscreva nesta vaga</h1>
            <p><strong>Nome:</strong> {aluno.nome}</p>
            <p><strong>Email:</strong> {aluno.email}</p>

            <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.Form}>
              <label>
                Telefone:
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(99) 99999-9999"
                  required
                />
              </label>

              <label>
                Currículo (PDF ou DOC):
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCurriculo(e.target.files[0])}
                  required
                />
              </label>

              <div className={styles.BotaoEnviar}>
                <button type="submit">Inscrever-se</button>
              </div>
            </form>

            {mensagem && <p className="mt-2 text-danger">{mensagem}</p>}
          </div>
        ) : (
          <p>{mensagem || 'Carregando dados do usuário...'}</p>
        )}

        {relacionadas.length === 0 ? (
          <h1 className="mt-5">Desculpe! Não temos vagas relacionadas no momento</h1>
        ) : (
          <>
            <h1 className="mt-5">Conheça algumas vagas relacionadas</h1>
            <CardVagas vagas={relacionadas} />
          </>
        )}

        {showModal && (
          <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalLabel"
            onClick={closeModal}
          >
            <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="modalLabel">Inscrição realizada</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <p>Você se inscreveu com sucesso nesta vaga! Boa sorte!</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn" onClick={closeModal}>
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
