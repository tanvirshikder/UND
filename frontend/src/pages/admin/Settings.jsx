import { useEffect, useState } from 'react';
import api from '../../api/axios';

const inputStyle = { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: '100%', boxSizing: 'border-box' };
const btnStyle = (color = '#1a3c5e') => ({ background: color, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 });

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({ monthly_amount: '', yearly_amount: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/api/settings/').then(r => {
      setSettings(r.data);
      setForm({ monthly_amount: r.data.monthly_amount, yearly_amount: r.data.yearly_amount });
    });
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    await api.put('/api/settings/', { monthly_amount: parseFloat(form.monthly_amount), yearly_amount: parseFloat(form.yearly_amount) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return <p>Loading...</p>;

  const yearlyTarget = parseFloat(form.monthly_amount || 0) * 12 + parseFloat(form.yearly_amount || 0);

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#1a3c5e' }}>Settings</h2>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, maxWidth: 480, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#444', fontWeight: 600 }}>Monthly Deposit Amount (৳)</label>
            <input type="number" style={inputStyle} value={form.monthly_amount} onChange={e => setForm({ ...form, monthly_amount: e.target.value })} required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#444', fontWeight: 600 }}>Yearly Deposit Amount (৳)</label>
            <input type="number" style={inputStyle} value={form.yearly_amount} onChange={e => setForm({ ...form, yearly_amount: e.target.value })} required />
          </div>
          <div style={{ background: '#f0f7ff', padding: '12px 16px', borderRadius: 6, marginBottom: 16, borderLeft: '4px solid #1a3c5e' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#444' }}>
              Yearly Target = (Monthly × 12) + Yearly = <strong>৳ {yearlyTarget.toLocaleString()}</strong>
            </p>
          </div>
          <button type="submit" style={btnStyle('#27ae60')}>
            {saved ? '✓ Saved!' : 'Update Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}
