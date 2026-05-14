import { useEffect, useState } from 'react';
import api from '../../api/axios';

const inputStyle = { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: '100%', boxSizing: 'border-box' };
const btnStyle = (color = '#1a3c5e') => ({ background: color, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 });
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ user_id: '', year: '', month: '', deposit_type: '' });
  const [form, setForm] = useState({ user_id: '', deposit_type: 'monthly', amount: '', deposit_date: '', year: new Date().getFullYear(), month: new Date().getMonth() + 1, note: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    api.get('/api/deposits/', { params }).then(r => setDeposits(r.data));
  };

  useEffect(() => { api.get('/api/users/').then(r => setUsers(r.data.filter(u => u.role === 'member'))); }, []);
  useEffect(() => { load(); }, [filters]);

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    try {
      const payload = { ...form, user_id: parseInt(form.user_id), amount: parseFloat(form.amount), year: parseInt(form.year) };
      if (form.deposit_type === 'monthly') payload.month = parseInt(form.month);
      else delete payload.month;
      await api.post('/api/deposits/', payload);
      setShowForm(false);
      load();
    } catch (err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this deposit?')) return;
    await api.delete(`/api/deposits/${id}`);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#1a3c5e' }}>Deposits</h2>
        <button style={btnStyle()} onClick={() => setShowForm(!showForm)}>+ Add Deposit</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 12, color: '#555' }}>Member *</label>
              <select style={inputStyle} value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} required>
                <option value="">Select member</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize: 12, color: '#555' }}>Type *</label>
              <select style={inputStyle} value={form.deposit_type} onChange={e => setForm({ ...form, deposit_type: e.target.value })}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div><label style={{ fontSize: 12, color: '#555' }}>Amount *</label><input type="number" style={inputStyle} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
            <div><label style={{ fontSize: 12, color: '#555' }}>Date *</label><input type="date" style={inputStyle} value={form.deposit_date} onChange={e => setForm({ ...form, deposit_date: e.target.value })} required /></div>
            <div><label style={{ fontSize: 12, color: '#555' }}>Year *</label><input type="number" style={inputStyle} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required /></div>
            {form.deposit_type === 'monthly' && (
              <div><label style={{ fontSize: 12, color: '#555' }}>Month</label>
                <select style={inputStyle} value={form.month} onChange={e => setForm({ ...form, month: e.target.value })}>
                  {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
            )}
            <div><label style={{ fontSize: 12, color: '#555' }}>Note</label><input style={inputStyle} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
          </div>
          {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={btnStyle('#27ae60')}>Save</button>
            <button type="button" style={btnStyle('#999')} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <select style={{ ...inputStyle, width: 160 }} value={filters.user_id} onChange={e => setFilters({ ...filters, user_id: e.target.value })}>
          <option value="">All Members</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
        </select>
        <input type="number" placeholder="Year" style={{ ...inputStyle, width: 100 }} value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })} />
        <select style={{ ...inputStyle, width: 130 }} value={filters.deposit_type} onChange={e => setFilters({ ...filters, deposit_type: e.target.value })}>
          <option value="">All Types</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#1a3c5e', color: '#fff' }}>
            <tr>{['Member', 'Type', 'Amount', 'Date', 'Year', 'Month', 'Note', 'Action'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {deposits.map((d, i) => (
              <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.user?.full_name || d.user_id}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}><span style={{ background: d.deposit_type === 'monthly' ? '#2980b9' : '#8e44ad', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{d.deposit_type}</span></td>
                <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>৳ {d.amount.toLocaleString()}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.deposit_date}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.year}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.month ? months[d.month - 1] : '-'}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.note || '-'}</td>
                <td style={{ padding: '10px 16px' }}><button onClick={() => handleDelete(d.id)} style={btnStyle('#e74c3c')}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {deposits.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: 20 }}>No deposits found</p>}
      </div>
    </div>
  );
}
