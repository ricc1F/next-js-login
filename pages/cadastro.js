import { useState } from 'react'
import { useRouter } from 'next/router'
import Input from '../src/components/forms/input/input'
import Button from '../src/components/forms/button/button'
import styles from '../styles/Login.module.css'

export default function CadastroPage() {
  const [form, setForm] = useState({
    nome_aluno: '',
    email: '',
    senha: '',
    idade: '',
    endereco_aluno: '',
    nome_escola: ''
  })

  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e, field) => {
    setForm({ ...form, [field]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/user/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await response.json()

      if (response.status !== 200) throw new Error(data)

      // Cadastro bem-sucedido: redirecionar
      router.push('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className={styles.background}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input placeholder="Nome" value={form.nome_aluno} onChange={(e) => handleChange(e, 'nome_aluno')} />
        <Input placeholder="Email" type="email" value={form.email} onChange={(e) => handleChange(e, 'email')} />
        <Input placeholder="Senha" type="password" value={form.senha} onChange={(e) => handleChange(e, 'senha')} />
        <Input placeholder="Idade" value={form.idade} onChange={(e) => handleChange(e, 'idade')} />
        <Input placeholder="Endereço" value={form.endereco_aluno} onChange={(e) => handleChange(e, 'endereco_aluno')} />
        <Input placeholder="Escola" value={form.nome_escola} onChange={(e) => handleChange(e, 'nome_escola')} />
        <Button type="submit">Cadastrar</Button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  )
}
