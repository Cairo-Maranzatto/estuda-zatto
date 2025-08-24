'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { SidebarProps, NavSection } from '../types/sidebar'
import styles from './Sidebar.module.css'

const sidebarData: NavSection[] = [
  {
    title: 'Dashboard',
    items: [
      {
        id: 'dashboard',
        label: 'Visão Geral',
        icon: 'fas fa-tachometer-alt',
      },
      {
        id: 'performance',
        label: 'Performance',
        icon: 'fas fa-chart-line',
        badge: { text: '+12', variant: 'success' },
      },
      {
        id: 'predictions',
        label: 'Predições IA',
        icon: 'fas fa-crystal-ball',
      },
    ],
  },
  {
    title: 'Áreas de Conhecimento',
    items: [
      {
        id: 'linguagens',
        label: 'Linguagens',
        icon: 'fas fa-book',
        badge: { text: '720', variant: 'success' },
      },
      {
        id: 'humanas',
        label: 'Ciências Humanas',
        icon: 'fas fa-landmark',
        badge: { text: '580', variant: 'warning' },
      },
      {
        id: 'natureza',
        label: 'Ciências Natureza',
        icon: 'fas fa-atom',
        badge: { text: '520', variant: 'error' },
      },
      {
        id: 'matematica',
        label: 'Matemática',
        icon: 'fas fa-calculator',
        badge: { text: '450', variant: 'error' },
      },
      {
        id: 'redacao',
        label: 'Redação',
        icon: 'fas fa-pen-fancy',
      },
    ],
  },
  {
    title: 'Ferramentas',
    items: [
      {
        id: 'simulados',
        label: 'Simulados',
        icon: 'fas fa-clipboard-check',
        badge: { text: '3', variant: 'warning' },
      },
      {
        id: 'cronograma',
        label: 'Cronograma IA',
        icon: 'fas fa-calendar-alt',
      },
      {
        id: 'questoes',
        label: 'Banco de Questões',
        icon: 'fas fa-question-circle',
      },
      {
        id: 'revisao',
        label: 'Sistema de Revisão',
        icon: 'fas fa-redo',
      },
    ],
  },
  {
    title: 'Análises',
    items: [
      {
        id: 'competencias',
        label: 'Mapa de Competências',
        icon: 'fas fa-puzzle-piece',
      },
      {
        id: 'tempo',
        label: 'Análise Temporal',
        icon: 'fas fa-clock',
      },
      {
        id: 'comparativo',
        label: 'Comparativo Nacional',
        icon: 'fas fa-users',
      },
    ],
  },
  {
    title: 'Configurações',
    items: [
      {
        id: 'perfil',
        label: 'Perfil de Estudo',
        icon: 'fas fa-user-cog',
      },
      {
        id: 'metas',
        label: 'Metas e Objetivos',
        icon: 'fas fa-bullseye',
      },
      {
        id: 'configuracoes',
        label: 'Configurações',
        icon: 'fas fa-cog',
      },
    ],
  },
]

export default function Sidebar({ 
  isCollapsed = false, 
  onToggle, 
  activeItem = 'dashboard',
  onItemClick 
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(isCollapsed)
  const [activeItemId, setActiveItemId] = useState(activeItem)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    setActiveItemId(activeItem)
  }, [activeItem])

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth <= 768) {
        setCollapsed(true)
      } else {
        setCollapsed(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleToggle = () => {
    setCollapsed(!collapsed)
    onToggle?.()
  }

  const handleItemClick = (itemId: string) => {
    console.log('Sidebar handleItemClick called with:', itemId); // Debug log
    setActiveItemId(itemId)
    console.log('About to call onItemClick with:', itemId); // Debug log
    onItemClick?.(itemId)
  }

  return (
    <>
      <button 
        className={styles.sidebarToggle}
        onClick={handleToggle}
        aria-label="Toggle sidebar"
      >
        <i className="fas fa-bars"></i>
      </button>

      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>🎯 EnemAnalytics</div>
          <div className={styles.sidebarSubtitle}>Sistema Inteligente de Aprendizado</div>
        </div>

        <nav className={styles.sidebarNav}>
          {sidebarData.map((section, sectionIndex) => (
            <div key={sectionIndex} className={styles.navSection}>
              <div className={styles.navSectionTitle}>{section.title}</div>
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.navItem} ${activeItemId === item.id ? styles.active : ''}`}
                  onClick={() => handleItemClick(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleItemClick(item.id)
                    }
                  }}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                  {item.badge && isAuthenticated && (
                    <span className={`${styles.navBadge} ${styles[item.badge.variant]}`}>
                      {item.badge.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
