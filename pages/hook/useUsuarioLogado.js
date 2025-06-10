'use client'

import { useEffect, useState } from 'react'
import { getCookie } from 'cookies-next'

export function useUsuarioLogado() {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true) 

  useEffect(() => {
    const token = getCookie('authorization')

    if (!token) {
      setCarregando(false)
      return
    }

    const fetchUsuario = async () => {
      try {
        const res = await fetch('/api/user/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) throw new Error('Não autorizado')

        const data = await res.json()
        setUsuario(data)
      } catch (error) {
        console.error('Erro ao buscar usuário:', error.message)
        setUsuario(null)
      } finally {
        setCarregando(false)
      }
    }

    fetchUsuario()
  }, [])

  return { usuario, carregando }
}
