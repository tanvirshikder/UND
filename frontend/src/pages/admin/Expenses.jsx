import { useEffect, useState } from 'react';
import api from '../../api/axios';

const inputStyle = { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: '100%', boxSizing: 'border-box' };
const btnStyle = (color = '#1a3c5e') => ({ background: color, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 });

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', expense_date: '', category: '', note: '' });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ year: '', month: '' });

  const load = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    api.get('/api/expenses/', { params }).then(r => setExpenses(r.data));
  };

  useEffect(() => { load(); }, [filters]);

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    try {
      await api.post('/api/expenses/', { ...form, amount: parseFloat(form.amount) });
      setForm({ title: '', amount: '', expense_date: '', category: '', note: '' });
      setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this expense?')) return;
    await api.delete(`/api/expenses/${id}`);
    load();
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#1a3c5e' }}>Expenses</h2>
        <button style={btnStyle()} onClick={() => setShowForm(!showForm)}>+ Add Expense</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 12, color: '#555' }}>Title *</label><input style={inputStyle} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            <div><label style={{ fontSize: 12, color: '#555' }}>Amount *</label><input type="number" style={inputStyle} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
            <div><label style={{ fontSize: 12, color: '#555' }}>Date *</label><input type="date" style={inputStyle} value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} required /></div>
            <div><label style={{ fontSize: 12, color: '#555' }}>Category</label><input style={inputStyle} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            <div><label style={{ fontSize: 12, color: '#555' }}>Note</label><input style={inputStyle} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
          </div>
          {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={btnStyle('#27ae60')}>Save</button>
            <button type="button" style={btnStyle('#999')} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <input type="number" placeholder="Year" style={{ ...inputStyle, width: 100 }} value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })} />
        <input type="number" placeholder="Month" style={{ ...inputStyle, width: 100 }} value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} />
        <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#e74c3c' }}>Total: ৳ {total.toLocaleString()}</span>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#1a3c5e', color: '#fff' }}>
            <tr>{['Title', 'Amount', 'Date', 'Category', 'Note', 'Action'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {expenses.map((e, i) => (
              <tr key={e.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{e.title}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#e74c3c' }}>৳ {e.amount.toLocaleString()}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{e.expense_date}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{e.category || '-'}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{e.note || '-'}</td>
                <td style={{ padding: '10px 16px' }}><button onClick={() => handleDelete(e.id)} style={btnStyle('#e74c3c')}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {expenses.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: 20 }}>No expenses found</p>}
      </div>
    </div>
  );
}
