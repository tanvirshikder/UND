import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';

const fmt = n => `৳ ${Number(n).toLocaleString()}`;

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/api/dashboard/admin').then(r => setData(r.data)); }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#1a3c5e' }}>Admin Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Total Members" value={data.total_members} color="#1a3c5e" />
        <StatCard label="Total Deposits" value={fmt(data.total_deposits)} color="#27ae60" />
        <StatCard label="Total Expenses" value={fmt(data.total_expenses)} color="#e74c3c" />
        <StatCard label="Net Balance" value={fmt(data.net_balance)} color="#8e44ad" />
        <StatCard label="This Month Collection" value={fmt(data.this_month_collection)} color="#2980b9" />
        <StatCard label="This Year Collection" value={fmt(data.this_year_collection)} color="#f39c12" />
      </div>
    </div>
  );
}
