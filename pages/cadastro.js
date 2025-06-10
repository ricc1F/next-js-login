import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Login.module.css'
import EstrelasCaindo from '../src/components/estrelas/Estrelas'

export default function CadastroPage() {
  const [form, setForm] = useState({
    nome_aluno: '',
    idade: '',
    endereco_aluno: '',
    nome_escola: '',
    nome_empresa: '',
    endereco_empresa: '',
    cnpj: '',
    email: '',
    senha: '',
    tipo_usuario: ''
  })

  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e, field) => {
    setForm({ ...form, [field]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const body =
      form.tipo_usuario === 'aluno'
        ? {
            nome_aluno: form.nome_aluno,
            email: form.email,
            senha: form.senha,
            idade: form.idade,
            endereco_aluno: form.endereco_aluno,
            nome_escola: form.nome_escola,
            tipo_usuario: 'aluno'
          }
        : {
            nome_empresa: form.nome_empresa,
            email_empresa: form.email, 
            senha: form.senha,
            endereco_empresa: form.endereco_empresa,
            cnpj: form.cnpj,
            tipo_usuario: 'empresa'
          }

    try {
      const response = await fetch('/api/user/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.status !== 200) throw new Error(data.error || 'Erro desconhecido')
      router.push('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className={styles.container}>
        <button
  onClick={() => window.location.href = 'http://localhost:3000/home'}
  style={{
    position: 'absolute',
    top: '2rem',
    left: '3rem',
    backgroundColor: 'black',
    color: 'white',
   borderColor:'white',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    zIndex: 1000
  }}
>
  HOME
</button>
      <EstrelasCaindo />

      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Cadastro</h1>
           {/* Tipo de usuário */}
        <select
          className={styles.input}
          value={form.tipo_usuario}
          onChange={(e) => handleChange(e, 'tipo_usuario')}
          required
        >
          <option value="" disabled hidden>Selecione o tipo de usuário</option>
          <option value="aluno">Aluno</option>
          <option value="empresa">Empresa</option>
        </select>

        {/* Email e Senha (comuns) */}
        <input
          className={styles.input}
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => handleChange(e, 'email')}
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Senha"
          value={form.senha}
          onChange={(e) => handleChange(e, 'senha')}
        />

     

        {/* Campos para Aluno */}
        {form.tipo_usuario === 'aluno' && (
          <>
            <input
              className={styles.input}
              placeholder="Nome do Aluno"
              value={form.nome_aluno}
              onChange={(e) => handleChange(e, 'nome_aluno')}
            />
            <input
              className={styles.input}
              placeholder="Idade"
              value={form.idade}
              onChange={(e) => handleChange(e, 'idade')}
            />
            <input
              className={styles.input}
              placeholder="Endereço"
              value={form.endereco_aluno}
              onChange={(e) => handleChange(e, 'endereco_aluno')}
            />
            <input
              className={styles.input}
              placeholder="Escola"
              value={form.nome_escola}
              onChange={(e) => handleChange(e, 'nome_escola')}
            />
          </>
        )}

        {/* Campos para Empresa */}
        {form.tipo_usuario === 'empresa' && (
          <>
            <input
              className={styles.input}
              placeholder="Nome da Empresa"
              value={form.nome_empresa}
              onChange={(e) => handleChange(e, 'nome_empresa')}
            />
            <input
              className={styles.input}
              placeholder="Endereço da Empresa"
              value={form.endereco_empresa}
              onChange={(e) => handleChange(e, 'endereco_empresa')}
            />
            <input
              className={styles.input}
              placeholder="CNPJ"
              value={form.cnpj}
              onChange={(e) => handleChange(e, 'cnpj')}
                maxLength={18}
            />
          </>
        )}

        {/* Exibe erro, se existir */}
        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.button}>Cadastrar</button>
      </form>
    </div>
  )
}
