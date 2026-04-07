import { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import '../css/DashboardLayout.css';

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <Topbar onToggleSidebar={toggleSidebar} />
      <div className="dashboard-container">
        {/* Usar col-md-auto ou similar mas vamos injetar classes dinâmicas para responsividade */}
        <div className={`sidebar-wrapper ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}>
          <Sidebar />
        </div>
        <main className="dashboard-main-content w-100 flex-grow-1">
          {children}
        </main>
      </div>
      
      {/* Overlay para fechar sidebar no telemóvel quando se clica fora */}
      {sidebarOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none" 
          style={{ zIndex: 35 }} 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default DashboardLayout;
