'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCookie, deleteCookie } from 'cookies-next';
import { useUsuarioLogado } from '../hook/useUsuarioLogado';
import { motion } from 'framer-motion';

import "bootstrap/dist/css/bootstrap.min.css";
import EstrelasCaindo from '../../src/components/estrelas/Estrelas';

import Header from '../../src/components/Header/Header';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AlunoVagas() {
  const searchParams = useSearchParams();
  const vagaId = searchParams.get('vagaId');

  const [vagas, setVagas] = useState([]);
  const [vaga, setVaga] = useState(null);
  const [relacionadas, setRelacionadas] = useState([]);
  const [telefone, setTelefone] = useState('');
  const [curriculo, setCurriculo] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { usuario: aluno, carregando, erro } = useUsuarioLogado();

  useEffect(() => {
    document.body.style.backgroundColor = 'black';
    document.body.style.margin = '0';
    document.body.style.overflowX = 'hidden';

    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.margin = '';
      document.body.style.overflowX = '';
    };
  }, []);

  useEffect(() => {
    async function fetchVagas() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/vagas`);
        const data = await res.json();
        const formatadas = data.map(v => ({
          ...v,
          id: v.vagas_id,
          atividades: v.atividades?.split(',') || [],
          requisitos: v.requisitos?.split(',') || [],
        }));
        setVagas(formatadas);
      } catch (err) {
        console.error(err);
        setMensagem('Erro ao carregar vagas.');
      }
    }

    fetchVagas();
  }, []);

  useEffect(() => {
    if (vagaId && vagas.length > 0) {
      const selecionada = vagas.find(v => v.id.toString() === vagaId);
      setVaga(selecionada);
      const relacionadas = vagas.filter(v => v.area === selecionada?.area && v.id !== selecionada?.id);
      setRelacionadas(relacionadas);
    }
  }, [vagaId, vagas]);

  async function handleSubmit(e) {
    e.preventDefault();
    const token = getCookie('authorization');

    if (!token) return setMensagem('Você precisa estar logado.');
    if (!telefone) return setMensagem('Por favor, preencha o telefone.');
    if (!curriculo) return setMensagem('Por favor, envie seu currículo.');

    const formData = new FormData();
    formData.append('vagas_id', vaga.id);
    formData.append('matricula', aluno.matricula);
    formData.append('curriculo', curriculo);
    formData.append('telefone', telefone);

    try {
      const res = await fetch(`${BACKEND_URL}/api/candidatura`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Erro ao enviar inscrição');
      }

      setTelefone('');
      setCurriculo(null);
      setShowModal(true);
      setMensagem('');
    } catch (err) {
      console.error(err);
      setMensagem(err.message || 'Erro ao enviar inscrição. Tente novamente.');
    }
  }

  const handleLogout = () => {
    deleteCookie('authorization');
    window.location.href = '/home';
  };

  function closeModal() {
    setShowModal(false);
  }

  return (
    <>
      <Header />
      <div className="container py-5 text-white mt-5 Formulario">
        <EstrelasCaindo />

        {carregando ? (
          <p className="text-white">Carregando dados do aluno...</p>
        ) : erro ? (
          <p className="text-danger">{erro}</p>
        ) : aluno ? null : (
          <p className="text-warning">Usuário não autenticado</p>
        )}

        {vaga && (
          <>
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="row align-items-start mb-5"
            >
          

              <div className="col-md-6 -flex justify-content-end"
              style={{ marginTop:'12rem'}}>
                <div className="bg-dark text-white mb-3 p-4 rounded">
                  <h2 className="mb-4 FormularioTitulo">Vaga Selecionada</h2>
                  <div className="card bg-white text-black p-3">
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
              </div>
              <div className="col-md-6 d-flex justify-content-start">
                <img 
                  src="/Astronautas/AstronautaAluno.png" 
                  alt="vaga" 
                  style={{ width: '25rem', height: 'auto', marginTop:'14rem', marginLeft:'8rem' }} 
                />
              </div>
            </motion.div>
          </>
        )}

        {vaga && aluno && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="row"
          >
            <div className="col-md-8 mx-auto">
              <div className="bg-dark text-white mb-3 p-4 rounded">
                <h1 className="FormularioTitulo mb-4">Se inscreva nesta vaga</h1>
                <p><strong>Nome:</strong> {aluno.nome}</p>
                <p><strong>Email:</strong> {aluno.email}</p>

                <form onSubmit={handleSubmit} encType="multipart/form-data" className="Form row g-3 mt-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Telefone:
                      <input
                        type="tel"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        placeholder="(99) 99999-9999"
                        required
                        maxLength={15}
                        className="form-control"
                      />
                    </label>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Currículo (PDF ou DOC):
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setCurriculo(e.target.files[0])}
                        required
                        className="form-control"
                      />
                    </label>
                  </div>

                  <div className="col-md-12 BotaoEnviar">
                    <button 
                      type="submit" 
                      className="btn btn"
                      style={{ backgroundColor: '#148a9d', borderColor: '#148a9d' }}
                    >
                      Inscrever-se
                    </button>
                  </div>
                </form>

                {mensagem && (
                  <div className={`alert ${mensagem.includes('Erro') ? 'alert-danger' : 'alert-warning'} mt-3`}>
                    {mensagem}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {showModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content bg-dark text-white">
                <div className="modal-header">
                  <h5 className="modal-title">Inscrição realizada</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <p>Você se inscreveu com sucesso nesta vaga! Boa sorte!</p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={closeModal}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}