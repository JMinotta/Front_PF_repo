import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Server, User, BarChart3 } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className="logo">
            <Server size={28} className="logo-icon" />
            <span>PaaS Deploy</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Menú</span>
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Panel de Control</span>
            </NavLink>
            <NavLink to="/deploy" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <PlusCircle size={20} />
              <span>Nuevo Despliegue</span>
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} />
              <span>Estadísticas</span>
            </NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">Desarrollador</span>
              <span className="user-role">Usuario PaaS</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div className="search-bar">
            {/* Optional search or context info */}
          </div>
          <div className="top-actions">
            {/* Settings removed per feedback */}
          </div>
        </header>
        
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
