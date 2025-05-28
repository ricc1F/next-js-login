import { useState } from 'react'
import { setCookie } from 'cookies-next'
import { useRouter } from 'next/router'
import Link from 'next/link'

import styles from '../styles/Login.module.css'

import LoginCard from '../src/components/cards/loginCard/login'
import Input from '../src/components/forms/input/input'
import Button from '../src/components/forms/button/button'

export default function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    tipo_usuario: ''
  })
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChangeForm = (event, field) => {
    setForm({
      ...form,
      [field]: event.target.value
    })
  }

  const handleForm = async (e) => {
    e.preventDefault()

    if (!form.email) return setError('O e-mail é obrigatório')
    if (!form.password) return setError('A senha é obrigatória')

    setError('')
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          senha: form.password,
          tipo_usuario: form.tipo_usuario
        })
      })      

      const data = await response.json()

      if (response.status !== 200) {
        throw new Error(typeof data === 'string' ? data : data.error || 'Erro desconhecido')
      }

      setCookie('authorization', data)
      router.push('/')
    } catch (err) {
      setError(err.message || 'Erro ao fazer login')
    }
  }

  return (
    <div className={styles.background}>
      <LoginCard title="Faça seu login">
        <form className={styles.form} onSubmit={handleForm}>
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={form.email}
            onChange={(event) => handleChangeForm(event, 'email')}
          />
          <Input
            type="password"
            placeholder="Sua senha"
            value={form.password}
            onChange={(event) => handleChangeForm(event, 'password')}
          />
          
          <select
            className={styles.select}
            value={form.tipo_usuario}
            onChange={(event) => handleChangeForm(event, 'tipo_usuario')}
            required
          >
            <option value="">Selecione o tipo de usuário</option>
            <option value="aluno">Aluno</option>
            <option value="empresa">Empresa</option>
          </select>

          <Button type="submit">Entrar</Button>
          {error && <p className={styles.error}>{error}</p>}
          <Link href="/cadastro">Não possui uma conta?</Link>
        </form>
      </LoginCard>
    </div>
  )
}
