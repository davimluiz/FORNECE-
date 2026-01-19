
import React, { useState } from 'react';
import { ViewType } from './types';
import EvaluationScreen from './screens/EvaluationScreen';
import RankingScreen from './screens/RankingScreen';
import ExternalScreen from './screens/ExternalScreen';
import ManagementScreen from './screens/ManagementScreen';
import { 
  Menu, 
  X,
  LayoutDashboard,
  ClipboardCheck,
  Globe,
  ShieldAlert
} from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('Avaliacao');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'Avaliacao', label: 'Avaliação', icon: ClipboardCheck },
    { id: 'Ranking', label: 'Ranking Geral', icon: LayoutDashboard },
    { id: 'Consulta', label: 'Consulta Externa', icon: Globe },
    { id: 'Gestao', label: 'Central do Gestor', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-[#003366] text-white p-4 flex justify-between items-center z-50">
        <div className="font-bold tracking-tight text-lg uppercase">FINDES - FORNECE+</div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar / Desktop Nav */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#003366] text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 hidden md:block">
          <div className="text-xl font-black tracking-tighter leading-none">FINDES<br/><span className="text-blue-300">FORNECE+</span></div>
          <div className="text-[10px] opacity-70 tracking-widest mt-2 font-medium uppercase">Portal de Gestão</div>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as ViewType);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${currentView === item.id 
                  ? 'bg-white text-[#003366] shadow-lg font-bold' 
                  : 'hover:bg-white/10 text-white/80'}
              `}
            >
              <item.icon size={20} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-8 right-8 text-[10px] text-white/40 leading-relaxed uppercase tracking-wider">
          © 2025 FINDES - FORNECE+.
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto">
          {currentView === 'Avaliacao' && <EvaluationScreen />}
          {currentView === 'Ranking' && <RankingScreen onOpenDetails={(s) => {}} />}
          {currentView === 'Consulta' && <ExternalScreen />}
          {currentView === 'Gestao' && <ManagementScreen />}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
