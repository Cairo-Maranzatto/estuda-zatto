'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';

type ActiveView = 'dashboard' | 'questoes' | 'simulados' | 'cronograma' | 'revisao' | 'areas' | 'ferramentas' | 'analises' | 'configuracoes' | 'linguagens' | 'humanas' | 'natureza' | 'matematica' | 'redacao' | 'performance' | 'predictions' | 'competencias' | 'tempo' | 'comparativo' | 'perfil' | 'metas';

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const handleViewChange = (view: ActiveView) => {
    setActiveView(view);
  };

  const handleSidebarItemClick = (itemId: string) => {
    console.log('Sidebar clicked:', itemId); // Debug log
    setActiveView(itemId as ActiveView);
  };

  console.log('Current activeView:', activeView); // Debug log

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        activeItem={activeView}
        onItemClick={handleSidebarItemClick}
      />
      <MainContent 
        activeView={activeView} 
        onViewChange={handleViewChange} 
      />
    </div>
  );
}
