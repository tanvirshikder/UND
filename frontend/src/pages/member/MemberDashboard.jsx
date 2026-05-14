import { useEffect, useState } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/StatCard';

const fmt = n => `৳ ${Number(n).toLocaleString()}`;

export default function MemberDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { api.get('/api/dashboard/member').then(r => setData(r.data)); }, []);

  if (!data) return <p>Loading...</p>;

  const progress = Math.min(100, (data.total_paid_this_year / data.yearly_target) * 100);

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#1a3c5e', marginBottom: 20 }}>My Dashboard — {data.current_year}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Paid (All Time)" value={fmt(data.total_paid)} color="#27ae60" />
        <StatCard label="Paid This Month" value={fmt(data.paid_this_month)} color="#2980b9" />
        <StatCard label={`Paid in ${data.current_year}`} value={fmt(data.total_paid_this_year)} color="#8e44ad" />
        <StatCard label="Yearly Target" value={fmt(data.yearly_target)} color="#1a3c5e" sub={`Monthly ৳${data.monthly_amount.toLocaleString()} + Yearly ৳${data.yearly_amount.toLocaleString()}`} />
        <StatCard label="Due This Year" value={fmt(data.due_this_year)} color={data.due_this_year > 0 ? '#e74c3c' : '#27ae60'} sub={data.due_this_year === 0 ? '✓ Target Completed!' : ''} />
      </div>

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#444', fontWeight: 600 }}>Yearly Progress ({data.current_year})</p>
        <div style={{ background: '#eee', borderRadius: 20, height: 20, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, background: progress >= 100 ? '#27ae60' : '#1a3c5e', height: '100%', borderRadius: 20, transition: 'width 0.5s' }} />
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#666' }}>{progress.toFixed(1)}% of yearly target achieved</p>
      </div>
    </div>
  );
}
