import { useEffect, useState } from 'react';
import api from '../../api/axios';

const inputStyle = { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: '100%', boxSizing: 'border-box' };
const btnStyle = (color = '#1a3c5e') => ({ background: color, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13 });

const BD_PHONE_RE = /^(?:\+8801|01)[3-9]\d{8}$/;
const validatePhone = phone => BD_PHONE_RE.test(phone.replace(/\s/g, ''));
const emptyCreate = { full_name: '', email: '', phone: '', password: '', role: 'member' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [createError, setCreateError] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const load = () => api.get('/api/users/').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async e => {
    e.preventDefault(); setCreateError('');
    if (!validatePhone(createForm.phone)) { setCreateError('Enter a valid BD mobile number (e.g. 01712345678)'); return; }
    try {
      await api.post('/api/users/', createForm);
      setCreateForm(emptyCreate); setShowCreate(false); load();
    } catch (err) { setCreateError(err.response?.data?.detail || 'Error'); }
  };

  const openEdit = u => { setEditUser(u); setEditForm({ full_name: u.full_name, email: u.email, phone: u.phone || '', role: u.role, is_active: u.is_active }); setEditError(''); };

  const handleEdit = async e => {
    e.preventDefault(); setEditError('');
    if (!validatePhone(editForm.phone)) { setEditError('Enter a valid BD mobile number (e.g. 01712345678)'); return; }
    try {
      await api.put(`/api/users/${editUser.id}`, editForm);
      setEditUser(null); load();
    } catch (err) { setEditError(err.response?.data?.detail || 'Error'); }
  };

  const openReset = u => { setResetUser(u); setNewPassword(''); setResetError(''); setResetSuccess(''); };

  const handleReset = async e => {
    e.preventDefault(); setResetError(''); setResetSuccess('');
    if (newPassword.length < 6) { setResetError('Password must be at least 6 characters'); return; }
    try {
      await api.post(`/api/users/${resetUser.id}/reset-password`, { new_password: newPassword });
      setResetSuccess('Password reset successfully!');
      setTimeout(() => setResetUser(null), 1500);
    } catch (err) { setResetError(err.response?.data?.detail || 'Error'); }
  };

  const toggleActive = async u => { await api.put(`/api/users/${u.id}`, { is_active: !u.is_active }); load(); };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: '#1a3c5e' }}>Members</h2>
        <button style={btnStyle()} onClick={() => { setShowCreate(true); setCreateError(''); setCreateForm(emptyCreate); }}>+ Add Member</button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal-box">
            <h3 style={{ margin: '0 0 18px', color: '#1a3c5e' }}>Add New Member</h3>
            <form onSubmit={handleCreate}>
              <div className="grid-2 form-grid" style={{ marginBottom: 12 }}>
                <div className="col-span-2">
                  <label style={{ fontSize: 12, color: '#555' }}>Full Name *</label>
                  <input style={inputStyle} value={createForm.full_name} onChange={e => setCreateForm({ ...createForm, full_name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#555' }}>Email *</label>
                  <input type="email" style={inputStyle} value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#555' }}>Mobile * <span style={{ color: '#999' }}>(BD)</span></label>
                  <input style={inputStyle} placeholder="01712345678" value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#555' }}>Password *</label>
                  <input type="password" style={inputStyle} value={createForm.password} onChange={e => setCreateForm({ ...createForm, password: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#555' }}>Role</label>
                  <select style={inputStyle} value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })}>
                    <option value="member">Member</option>
                    <option value="account">Account</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              {createError && <p style={{ color: '#e74c3c', fontSize: 13, margin: '0 0 10px' }}>{createError}</p>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" style={btnStyle('#999')} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" style={btnStyle('#27ae60')}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setEditUser(null)}>
          <div className="modal-box">
            <h3 style={{ margin: '0 0 18px', color: '#1a3c5e' }}>Edit Member</h3>
            <form onSubmit={handleEdit}>
              <div className="grid-2 form-grid" style={{ marginBottom: 12 }}>
                <div className="col-span-2">
                  <label style={{ fontSize: 12, color: '#555' }}>Full Name *</label>
                  <input style={inputStyle} value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#555' }}>Email *</label>
                  <input type="email" style={inputStyle} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#555' }}>Mobile * <span style={{ color: '#999' }}>(BD)</span></label>
                  <input style={inputStyle} placeholder="01712345678" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#555' }}>Role</label>
                  <select style={inputStyle} value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                    <option value="member">Member</option>
                    <option value="account">Account</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 18 }}>
                  <input type="checkbox" id="is_active" checked={editForm.is_active} onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })} />
                  <label htmlFor="is_active" style={{ fontSize: 13, color: '#444' }}>Active</label>
                </div>
              </div>
              {editError && <p style={{ color: '#e74c3c', fontSize: 13, margin: '0 0 10px' }}>{editError}</p>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" style={btnStyle('#999')} onClick={() => setEditUser(null)}>Cancel</button>
                <button type="submit" style={btnStyle('#1a3c5e')}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <div style={overlay} onClick={e => e.target === e.currentTarget && setResetUser(null)}>
          <div className="modal-box modal-box-sm">
            <h3 style={{ margin: '0 0 6px', color: '#1a3c5e' }}>Reset Password</h3>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: '#666' }}>for <strong>{resetUser.full_name}</strong></p>
            <form onSubmit={handleReset}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: '#555' }}>New Password *</label>
                <input type="password" style={inputStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} placeholder="Min. 6 characters" />
              </div>
              {resetError && <p style={{ color: '#e74c3c', fontSize: 13, margin: '0 0 10px' }}>{resetError}</p>}
              {resetSuccess && <p style={{ color: '#27ae60', fontSize: 13, margin: '0 0 10px' }}>{resetSuccess}</p>}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" style={btnStyle('#999')} onClick={() => setResetUser(null)}>Cancel</button>
                <button type="submit" style={btnStyle('#e67e22')}>Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#1a3c5e', color: '#fff' }}>
            <tr>{['Name', 'Email', 'Mobile', 'Role', 'Status', 'Actions'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{u.full_name}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{u.email}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>{u.phone || '-'}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>
                  <span style={{ background: u.role === 'admin' ? '#1a3c5e' : u.role === 'account' ? '#8e44ad' : '#27ae60', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{u.role}</span>
                </td>
                <td style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
                  <span style={{ color: u.is_active ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>{u.is_active ? 'Active' : 'Inactive'}</span>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
                    <button onClick={() => openEdit(u)} style={btnStyle('#2980b9')}>Edit</button>
                    <button onClick={() => openReset(u)} style={btnStyle('#e67e22')}>Reset PW</button>
                    <button onClick={() => toggleActive(u)} style={btnStyle(u.is_active ? '#e74c3c' : '#27ae60')}>
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: 20 }}>No users found</p>}
      </div>
    </div>
  );
}
