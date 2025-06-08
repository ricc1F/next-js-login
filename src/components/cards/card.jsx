'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './card.module.css';

export default function CardVagas({
  vagas = [],
  exibirModal = true,
  botaoPersonalizado,
  limiteInicial = 6,
}) {
  const [visibleCount, setVisibleCount] = useState(limiteInicial);
  const [modalVisible, setModalVisible] = useState(false);
  const [vagaSelecionada, setVagaSelecionada] = useState(null);

  const handleToggle = (action) => {
    if (action === 'more' && visibleCount < vagas.length) {
      setVisibleCount((prev) => Math.min(prev + 6, vagas.length));
    } else if (action === 'less' && visibleCount > limiteInicial) {
      setVisibleCount((prev) => Math.max(prev - 6, limiteInicial));
    }
  };

  const abrirModal = (vaga) => {
    if (!exibirModal) return;
    setVagaSelecionada(vaga);
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setVagaSelecionada(null);
  };

  return (
    <section className={styles.background}>
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="row">
          <div className={`col-md-12 mt-4 mb-4 ${styles.ConhecaVagas}`}>
            {vagas.length === 0 && (
              <div className={styles.atronauta}>
                <div className={styles.astronaut}>
                  <div className={styles.head}></div>
                  <div className={`${styles.arm} ${styles.armLeft}`}></div>
                  <div className={`${styles.arm} ${styles.armRight}`}></div>
                  <div className={styles.body}>
                    <div className={styles.panel}></div>
                  </div>
                  <div className={styles.legLeft}></div>
                  <div className={styles.legRight}></div>
                  <div className={styles.schoolbag}></div>
                </div>
                <h1> Desculpe! Não encontramos vagas no momento.</h1>
              </div>
            )}
          </div>
        </div>

        <div className={styles.Cards}>
          <div className="row">
            <div className={`col-md-12 mb-5 ${styles.CardVagas} d-flex flex-wrap justify-content-center`}>
              {vagas.slice(0, visibleCount).map((vaga, index) => (
                <motion.div
                  key={vaga.id || index}
                  className={`card m-2 mt-3 mb-2 ${styles.customCard}`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="card-body">
                    <h5 className="card-title">{vaga.titulo}</h5>
                    <h6 className={styles.decription}>{vaga.descricao}</h6>
                    <div className={`card-text ${styles.TextoCards}`}>
                      <div className={styles.cardInfoItem}>
                        <img src="/IconsCards/star.png" alt="estrela" /> {vaga.area}
                      </div>
                      <div className={styles.cardInfoItem}>
                        <img src="/IconsCards/location.png" alt="localização" /> {vaga.localizacao} - {vaga.estado}
                      </div>
                      <div className={styles.cardInfoItem}>
                        <img src="/IconsCards/clock.png" alt="relógio" /> {vaga.horario}
                      </div>
                      <div className={styles.cardInfoItem}>
                        <img src="/IconsCards/dollar.png" alt="dólar" /> {vaga.salario}
                      </div>
                    </div>
                    {botaoPersonalizado ? (
                      botaoPersonalizado(vaga)
                    ) : (
                      <button
                        onClick={() => abrirModal(vaga)}
                        className={`btn btn ${styles.BotaoCards} mt-2`}
                        style={{
                          borderColor: '#148a9d',
                          color: '#000',
                          border: '2px solid #148a9d',
                        }}
                      >
                        Ver Detalhes
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {exibirModal && modalVisible && vagaSelecionada && (
          <motion.div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <motion.div
              className="modal-dialog modal-md modal-dialog-centered modal-dialog-scrollable"
              initial={{ scale: 0.95, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 0 }}
              transition={{ duration: 0 }}
            >
              <div className="modal-content">
                <div className={styles.BotaoXModal}>
                  <button type="button" className="btn-close" onClick={fecharModal}></button>
                </div>
                <div className={styles.ConteudoModal}>
                  <h5 className="modal-title">{vagaSelecionada.titulo}</h5>
                  <h6 className={styles.decription}>{vagaSelecionada.descricao}</h6>
                  <p><img src="/IconsCards/star.png" alt="estrela" /> {vagaSelecionada.area}</p>
                  <p><img src="/IconsCards/location.png" alt="localização" /> {vagaSelecionada.localizacao}</p>
                  <p><img src="/IconsCards/clock.png" alt="relógio" /> {vagaSelecionada.horario}</p>
                  <p><img src="/IconsCards/dollar.png" alt="dólar" /> {vagaSelecionada.salario}</p>
                  <div className="mb-3">
                    <strong>Atividades</strong>
                    <ul>
                      {vagaSelecionada.atividades?.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                  <div className="mb-2">
                    <strong>Requisitos</strong>
                    <ul>
                      {vagaSelecionada.requisitos?.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
                <div className={styles.BotaoModal}>
                  <Link href={`/alunos?vagaId=${vagaSelecionada.id}`} passHref>
                    <button
                      type="button"
                      className="btn btn"
                      style={{
                        borderColor: '#148a9d',
                        width: '20rem',
                        border: '2px solid #148a9d',
                        color: '#000',
                      }}
                    >
                      Tenho Interesse
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`text-center mt-1 ${styles.BotaoVerMais}`}>
        {visibleCount < vagas.length && (
          <button className="btn btn" onClick={() => handleToggle('more')}>
            Carregar mais
          </button>
        )}
      </div>
    </section>
  );
}
