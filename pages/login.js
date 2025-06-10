'use client';

import { useState, useEffect } from 'react';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';
import EstrelasCaindo from '../src/components/estrelas/Estrelas';

import styles from '../styles/Login.module.css';

export default function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    tipo_usuario: ''
  });

  const [error, setError] = useState('');
  const router = useRouter();

  // Captura o vagaId da query, se existir
  const vagaId = router.query?.vagaId;

  const handleChangeForm = (event, field) => {
    setForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleForm = async (e) => {
    e.preventDefault();

    // Validação simples
    if (!form.email) return setError('O e-mail é obrigatório');
    if (!form.password) return setError('A senha é obrigatória');
    if (!form.tipo_usuario) return setError('Selecione o tipo de usuário');

    setError('');

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          senha: form.password,
          tipo_usuario: form.tipo_usuario
        })
      });

      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(typeof data === 'string' ? data : data.error || 'Erro desconhecido');
      }

      // Salvar o token JWT
      setCookie('authorization', data.token || data, {
        path: '/', // importante
        maxAge: 60 * 60 * 24, // 1 dia
      });


      const decoded = jwtDecode(data);

      // Redirecionamento por tipo
      if (decoded.tipo === 'empresa') {
        router.push('/empresa/dashboard');
      } else if (decoded.tipo === 'aluno') {
        if (vagaId) {
          router.push(`/aluno/perfil?vagaId=${vagaId}`);
        } else {
          window.location.href = 'http://localhost:3000/home';

        }
      }

      else {
        setError('Tipo de usuário não reconhecido');
      }
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

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

      <div className={styles.loginBox}>
        <h2 className={styles.title}>Login</h2>

        <form className={styles.form} onSubmit={handleForm}>
          <select
            className={styles.select}
            value={form.tipo_usuario}
            onChange={(e) => handleChangeForm(e, 'tipo_usuario')}
            required
          >
            <option value="" disabled hidden>Tipo de usuário</option>
            <option value="aluno">Aluno</option>
            <option value="empresa">Empresa</option>
          </select>
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChangeForm(e, 'email')}
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={(e) => handleChangeForm(e, 'password')}
          />


          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit">Entrar</button>

          <p className={styles.link}>
            <Link href="/cadastro">Não possui uma conta? Cadastre-se</Link>
          </p>
        </form>
      </div>
    </div>
  );
}


