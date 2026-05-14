import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const adminLinks = [
  { to: '/admin/dashboard', label: '📊 Dashboard' },
  { to: '/admin/users', label: '👥 Members' },
  { to: '/admin/deposits', label: '💰 Deposits' },
  { to: '/admin/expenses', label: '📋 Expenses' },
  { to: '/admin/reports', label: '📈 Reports' },
  { to: '/admin/settings', label: '⚙️ Settings' },
];

const memberLinks = [
  { to: '/member/dashboard', label: '📊 Dashboard' },
  { to: '/member/deposits', label: '💰 My Deposits' },
  { to: '/member/report', label: '📈 My Report' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = user?.role === 'member' ? memberLinks : adminLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <aside style={{ width: 220, background: '#1a3c5e', color: '#fff', padding: '20px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #2d5a8e' }}>
          <h2 style={{ margin: 0, fontSize: 20, color: '#f0c040' }}>🏗️ UND</h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#aac' }}>Unity & Development</p>
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              display: 'block', padding: '10px 20px', color: location.pathname === l.to ? '#f0c040' : '#cde',
              textDecoration: 'none', background: location.pathname === l.to ? '#2d5a8e' : 'transparent',
              borderLeft: location.pathname === l.to ? '3px solid #f0c040' : '3px solid transparent',
              fontSize: 14
            }}>{l.label}</Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #2d5a8e' }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#aac' }}>{user?.full_name}</p>
          <p style={{ margin: '0 0 8px', fontSize: 11, color: '#88a', textTransform: 'uppercase' }}>{user?.role}</p>
          <button onClick={handleLogout} style={{ background: '#c0392b', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Logout</button>
        </div>
      </aside>
      <main style={{ flex: 1, background: '#f4f6f9', padding: 24, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
