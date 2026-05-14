import { useEffect, useState, useRef } from 'react';
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

  // Bulk upload state
  const [showBulk, setShowBulk] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState('');
  const fileInputRef = useRef();

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
      setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.detail || 'Error'); }
  };

  const handleDelete = async id => {
    if (!confirm('Delete this deposit?')) return;
    await api.delete(`/api/deposits/${id}`); load();
  };

  // ── Bulk upload handlers ──
  const handleDownloadTemplate = async () => {
    const res = await api.get('/api/deposits/bulk-template', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UND_Deposit_Upload_Template.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async e => {
    e.preventDefault();
    if (!bulkFile) { setBulkError('Please select an Excel file.'); return; }
    setBulkLoading(true); setBulkResult(null); setBulkError('');
    const fd = new FormData();
    fd.append('file', bulkFile);
    try {
      const res = await api.post('/api/deposits/bulk-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBulkResult(res.data);
      if (res.data.inserted > 0) load();
    } catch (err) {
      setBulkError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const resetBulk = () => {
    setBulkFile(null); setBulkResult(null); setBulkError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 10, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, color: '#1a3c5e' }}>Deposits</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={btnStyle('#27ae60')} onClick={() => { setShowBulk(true); resetBulk(); }}>⬆ Bulk Upload</button>
          <button style={btnStyle()} onClick={() => setShowForm(!showForm)}>+ Add Deposit</button>
        </div>
      </div>

      {/* Single deposit form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div className="grid-3 form-grid" style={{ marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#555' }}>Member *</label>
              <select style={inputStyle} value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} required>
                <option value="">Select member</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#555' }}>Type *</label>
              <select style={inputStyle} value={form.deposit_type} onChange={e => setForm({ ...form, deposit_type: e.target.value })}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div><label style={{ fontSize: 12, color: '#555' }}>Amount *</label><input type="number" style={inputStyle} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
            <div><label style={{ fontSize: 12, color: '#555' }}>Date *</label><input type="date" style={inputStyle} value={form.deposit_date} onChange={e => setForm({ ...form, deposit_date: e.target.value })} required /></div>
            <div><label style={{ fontSize: 12, color: '#555' }}>Year *</label><input type="number" style={inputStyle} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required /></div>
            {form.deposit_type === 'monthly' && (
              <div>
                <label style={{ fontSize: 12, color: '#555' }}>Month</label>
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

      {/* Bulk Upload Modal */}
      {showBulk && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setShowBulk(false)}>
          <div className="modal-box" style={{ maxWidth: 540 }}>
            <h3 style={{ margin: '0 0 4px', color: '#1a3c5e' }}>Bulk Upload Deposits</h3>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: '#666' }}>Upload an Excel file (.xlsx) to insert multiple deposits at once.</p>

            {/* Step 1 — Download template */}
            <div style={{ background: '#f0f7ff', border: '1px solid #c8e0f8', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#1a3c5e' }}>Step 1 — Download the template</p>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: '#555' }}>
                The template includes your registered members' emails as sample rows and an Instructions sheet explaining every column.
              </p>
              <button type="button" style={btnStyle('#1a3c5e')} onClick={handleDownloadTemplate}>
                ⬇ Download Template (.xlsx)
              </button>
            </div>

            {/* Step 2 — Column reference */}
            <div style={{ background: '#fffbf0', border: '1px solid #f0d080', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: '#856404' }}>Step 2 — Fill in the Deposits sheet</p>
              <div className="table-wrap" style={{ boxShadow: 'none', border: '1px solid #e8d8a0', borderRadius: 6 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f5e9b8' }}>
                      {['Column', 'Required', 'Example'].map(h => (
                        <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#5a4000' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['member_email', '✓', 'alice@example.com'],
                      ['deposit_type', '✓', 'monthly  or  yearly'],
                      ['amount', '✓', '1000'],
                      ['deposit_date', '✓', '2024-06-01'],
                      ['year', '✓', '2024'],
                      ['month', 'monthly only', '6'],
                      ['note', '—', 'June payment'],
                    ].map(([col, req, ex]) => (
                      <tr key={col} style={{ borderTop: '1px solid #e8d8a0' }}>
                        <td style={{ padding: '5px 10px', fontFamily: 'monospace', color: '#1a3c5e', fontWeight: 600 }}>{col}</td>
                        <td style={{ padding: '5px 10px', color: req === '✓' ? '#27ae60' : '#888' }}>{req}</td>
                        <td style={{ padding: '5px 10px', color: '#555' }}>{ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 3 — Upload */}
            <div style={{ background: '#f4f6f9', border: '1px solid #ddd', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#333' }}>Step 3 — Upload your file</p>
              <form onSubmit={handleBulkUpload}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={e => { setBulkFile(e.target.files[0]); setBulkResult(null); setBulkError(''); }}
                    style={{ flex: 1, fontSize: 13, minWidth: 0 }}
                  />
                  <button type="submit" style={btnStyle('#27ae60')} disabled={bulkLoading}>
                    {bulkLoading ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
                {bulkError && <p style={{ color: '#e74c3c', fontSize: 13, marginTop: 8 }}>{bulkError}</p>}
              </form>
            </div>

            {/* Result */}
            {bulkResult && (
              <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ background: bulkResult.inserted > 0 ? '#e8f8f0' : '#fff3f3', padding: '12px 16px', borderLeft: `4px solid ${bulkResult.inserted > 0 ? '#27ae60' : '#e74c3c'}` }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: bulkResult.inserted > 0 ? '#1a7a4a' : '#c0392b' }}>
                    ✓ {bulkResult.inserted} deposit{bulkResult.inserted !== 1 ? 's' : ''} inserted
                    {bulkResult.skipped > 0 && ` · ${bulkResult.skipped} row${bulkResult.skipped !== 1 ? 's' : ''} skipped`}
                  </p>
                </div>
                {bulkResult.skipped_details?.length > 0 && (
                  <div style={{ background: '#fff8f8', padding: '10px 16px', borderLeft: '4px solid #e74c3c', maxHeight: 180, overflowY: 'auto' }}>
                    <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: '#c0392b' }}>Skipped rows:</p>
                    {bulkResult.skipped_details.map((s, i) => (
                      <p key={i} style={{ margin: '2px 0', fontSize: 12, color: '#555' }}>
                        Row {s.row} ({s.email || 'blank'}): {s.errors.join(', ')}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {bulkResult && <button type="button" style={btnStyle('#2980b9')} onClick={resetBulk}>Upload Another</button>}
              <button type="button" style={btnStyle('#999')} onClick={() => setShowBulk(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <select style={inputStyle} value={filters.user_id} onChange={e => setFilters({ ...filters, user_id: e.target.value })}>
          <option value="">All Members</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
        </select>
        <input type="number" placeholder="Year" style={inputStyle} value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })} />
        <select style={inputStyle} value={filters.deposit_type} onChange={e => setFilters({ ...filters, deposit_type: e.target.value })}>
          <option value="">All Types</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Deposits table */}
      <div className="table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#1a3c5e', color: '#fff' }}>
            <tr>{['Member', 'Type', 'Amount', 'Date', 'Year', 'Month', 'Note', 'Action'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, whiteSpace: 'nowrap' }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {deposits.map((d, i) => (
              <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>{d.user?.full_name || d.user_id}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>
                  <span style={{ background: d.deposit_type === 'monthly' ? '#2980b9' : '#8e44ad', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{d.deposit_type}</span>
                </td>
                <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>৳ {d.amount.toLocaleString()}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>{d.deposit_date}</td>
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
