import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Login.module.css'

export default function CadastroPage() {
  const [form, setForm] = useState({
    nome_empresa: '',
    email_empresa: '',
    senha: '',
    endereco_empresa: '',
    tipo_usuario: 'empresa'
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
            nome_empresa: form.nome_aluno, // reutilizando o campo nome_aluno como nome_empresa
            email_empresa: form.email,
            senha: form.senha,
            endereco_empresa: form.endereco_aluno, // reutilizando o campo endereco_aluno
            tipo_usuario: 'empresa'
          }
  
    try {
      const response = await fetch('/api/user/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
  
      const data = await response.json()
  
      if (response.status !== 200) throw new Error(typeof data === 'string' ? data : data.error || 'Erro desconhecido')
  
      router.push('/')
    } catch (err) {
      setError(err.message)
    }
  }
  

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Cadastro</h1>

        <input
          className={styles.input}
          placeholder="Nome"
          value={form.nome_aluno}
          onChange={(e) => handleChange(e, 'nome_aluno')}
        />
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
        <select
          className={styles.input}
          value={form.tipo_usuario}
          onChange={(e) => handleChange(e, 'tipo_usuario')}
          required
        >
          <option value="">Selecione o tipo de usuário</option>
          <option value="aluno">Aluno</option>
          <option value="empresa">Empresa</option>
        </select>

        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.button}>Cadastrar</button>
      </form>
    </div>
  )
}
