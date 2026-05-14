import { useEffect, useState } from 'react';
import api from '../../api/axios';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const inputStyle = { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: '100%', boxSizing: 'border-box' };

export default function MemberDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [filters, setFilters] = useState({ year: '', deposit_type: '' });

  const load = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    api.get('/api/deposits/', { params }).then(r => setDeposits(r.data));
  };

  useEffect(() => { load(); }, [filters]);

  const total = deposits.reduce((s, d) => s + d.amount, 0);

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#1a3c5e' }}>My Deposits</h2>

      <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="number" placeholder="Year" style={{ ...inputStyle, width: 100 }} value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })} />
        <select style={{ ...inputStyle, width: 140 }} value={filters.deposit_type} onChange={e => setFilters({ ...filters, deposit_type: e.target.value })}>
          <option value="">All Types</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#27ae60', fontSize: 15 }}>Total: ৳ {total.toLocaleString()}</span>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#1a3c5e', color: '#fff' }}>
            <tr>{['Type', 'Amount', 'Date', 'Year', 'Month', 'Note'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {deposits.map((d, i) => (
              <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ padding: '10px 16px', fontSize: 13 }}><span style={{ background: d.deposit_type === 'monthly' ? '#2980b9' : '#8e44ad', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{d.deposit_type}</span></td>
                <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#27ae60' }}>৳ {d.amount.toLocaleString()}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.deposit_date}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.year}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.month ? months[d.month - 1] : '-'}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {deposits.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: 20 }}>No deposits found</p>}
      </div>
    </div>
  );
}
