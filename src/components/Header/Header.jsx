
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCookie, deleteCookie } from 'cookies-next'
import { jwtDecode } from 'jwt-decode'
import styles from './Header.module.css'

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const token = getCookie('authorization');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({
                    nome: decoded.nome || decoded.email,
                    tipo: decoded.tipo
                });

                fetch('http://localhost:3001/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: 'include',
                })
                    .then((res) => res.ok ? res.json() : Promise.reject("Token inválido"))
                    .then((data) => setUser(data))
                    .catch(() => {
                        deleteCookie('authorization');
                        setUser(null);
                    });
            } catch (err) {
                console.error('Token inválido:', err);
                deleteCookie('authorization');
                setUser(null);
            }
        }
    }, []);

    const handleLogout = () => {
        deleteCookie('authorization')
        setUser(null)
 window.location.href = 'http://localhost:3000/home'
    }

    return (
        <header className={styles.mainHeader}>
            <nav className={styles.navbar}>
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={styles.menuToggle}
                    aria-label="Toggle menu"
                >
                    <svg className={styles.menuIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {menuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                <img src="/Astronautas/AstronautaLogo.png" alt="logo" className={styles.logo} />

                <ul className={`${styles.menu} ${menuOpen ? styles.menuOpen : ''}`}>
                    <li> <Link href="http://localhost:3000/home">Home</Link></li>
                    <li><a href="#">Vitrine de Vagas</a></li>
                    <li><a href="#">Sobre nós</a></li>
                </ul>

                <div className={`${styles.authButtons} ${menuOpen ? styles.authButtonsOpen : ''}`}>
                    {!user ? (
                        <>
                            <Link href="http://localhost:3001/login" className={styles.login}>Login</Link>
                            <Link href="http://localhost:3001/cadastro" className={styles.cadastre}>Cadastre-se</Link>
                        </>
                    ) : (
                        <>
                            <span className={styles.userInfo}>
                                {user.nome || user.email}
                            </span>

                            {/* Exibe botão de Perfil apenas se NÃO for empresa */}
                            {user.tipo !== 'empresa' && (
                                <Link href="http://localhost:3000/aluno/perfil" className={styles.login}>Perfil</Link>
                            )}

                            <button onClick={handleLogout} className={styles.logoutButton}>Sair</button>
                        </>
                    )}

                </div>
            </nav>
        </header>
    )
}