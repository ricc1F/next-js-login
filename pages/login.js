import { useState } from 'react'
import { setCookie } from 'cookies-next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { jwtDecode } from 'jwt-decode'

import styles from '../styles/Login.module.css'

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
    if (!form.tipo_usuario) return setError('Selecione o tipo de usuário')

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
      const decoded = jwtDecode(data)

      if (decoded.tipo === 'empresa') {
        router.push('/empresa/dashboard')
      } else {
        router.push('/aluno/perfil')
      }

    } catch (err) {
      setError(err.message || 'Erro ao fazer login')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Login</h2>
        <form className={styles.form} onSubmit={handleForm}>
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => handleChangeForm(event, 'email')}
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={(event) => handleChangeForm(event, 'password')}
          />
          <select
            className={styles.select}
            value={form.tipo_usuario}
            onChange={(event) => handleChangeForm(event, 'tipo_usuario')}
            required
          >
            <option value="">Tipo de usuário</option>
            <option value="aluno">Aluno</option>
            <option value="empresa">Empresa</option>
          </select>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit">Entrar</button>
          <p className={styles.link}>
            <Link href="/cadastro">Não possui uma conta? Cadastre-se</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
