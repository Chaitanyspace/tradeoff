import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-brand">TradeOff</div>
        <div className="nav-tabs">
         
          <NavLink to="/risk-office-pro" className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}>
            ⚡ Risk Office Pro
          </NavLink>
        </div>
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
