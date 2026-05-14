import { useEffect, useState } from 'react';
import api from '../../api/axios';

const inputStyle = { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: '100%', boxSizing: 'border-box' };
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminReports() {
  const [tab, setTab] = useState('deposits');
  const [users, setUsers] = useState([]);
  const [depositReport, setDepositReport] = useState(null);
  const [expenseReport, setExpenseReport] = useState(null);
  const [memberSummary, setMemberSummary] = useState(null);
  const [filters, setFilters] = useState({ user_id: '', year: new Date().getFullYear() });

  useEffect(() => { api.get('/api/users/').then(r => setUsers(r.data.filter(u => u.role === 'member'))); }, []);

  const loadDeposits = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    api.get('/api/reports/deposits', { params }).then(r => setDepositReport(r.data));
  };

  const loadExpenses = () => {
    const params = filters.year ? { year: filters.year } : {};
    api.get('/api/reports/expenses-summary', { params }).then(r => setExpenseReport(r.data));
  };

  const loadMemberSummary = () => {
    const params = filters.year ? { year: filters.year } : {};
    api.get('/api/reports/member-summary', { params }).then(r => setMemberSummary(r.data));
  };

  useEffect(() => {
    if (tab === 'deposits') loadDeposits();
    else if (tab === 'expenses') loadExpenses();
    else loadMemberSummary();
  }, [tab, filters]);

  const tabStyle = active => ({ padding: '8px 20px', border: 'none', cursor: 'pointer', borderBottom: active ? '3px solid #1a3c5e' : '3px solid transparent', background: 'none', fontWeight: active ? 700 : 400, color: active ? '#1a3c5e' : '#666', fontSize: 14 });

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#1a3c5e' }}>Reports</h2>
      <div style={{ borderBottom: '1px solid #ddd', marginBottom: 20 }}>
        <button style={tabStyle(tab === 'deposits')} onClick={() => setTab('deposits')}>Deposit Report</button>
        <button style={tabStyle(tab === 'expenses')} onClick={() => setTab('expenses')}>Expense Report</button>
        <button style={tabStyle(tab === 'members')} onClick={() => setTab('members')}>Member Summary</button>
      </div>

      <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input type="number" placeholder="Year" style={{ ...inputStyle, width: 100 }} value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })} />
        {tab === 'deposits' && (
          <select style={{ ...inputStyle, width: 180 }} value={filters.user_id} onChange={e => setFilters({ ...filters, user_id: e.target.value })}>
            <option value="">All Members</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
          </select>
        )}
      </div>

      {tab === 'deposits' && depositReport && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ background: '#fff', padding: '16px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #27ae60' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Total Collected</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#27ae60' }}>৳ {depositReport.total.toLocaleString()}</p>
            </div>
            <div style={{ background: '#fff', padding: '16px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #1a3c5e' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Yearly Target / Member</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a3c5e' }}>৳ {depositReport.yearly_target.toLocaleString()}</p>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#1a3c5e', color: '#fff' }}>
                <tr>{['Member', 'Type', 'Amount', 'Date', 'Year', 'Month', 'Note'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {depositReport.deposits.map((d, i) => (
                  <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.user_name}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.deposit_type}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>৳ {d.amount.toLocaleString()}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.deposit_date}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.year}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.month ? months[d.month - 1] : '-'}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'expenses' && expenseReport && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ background: '#fff', padding: '16px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #e74c3c' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Total Expenses</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e74c3c' }}>৳ {expenseReport.total.toLocaleString()}</p>
            </div>
            {Object.entries(expenseReport.by_category).map(([cat, amt]) => (
              <div key={cat} style={{ background: '#fff', padding: '16px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #f39c12' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{cat}</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f39c12' }}>৳ {amt.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#1a3c5e', color: '#fff' }}>
                <tr>{['Title', 'Amount', 'Date', 'Category', 'Note'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {expenseReport.expenses.map((e, i) => (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{e.title}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#e74c3c' }}>৳ {e.amount.toLocaleString()}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{e.expense_date}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{e.category || '-'}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{e.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'members' && memberSummary && (
        <div>
          <p style={{ color: '#666', marginBottom: 12 }}>Year: {memberSummary.year} | Yearly Target per Member: ৳ {memberSummary.yearly_target.toLocaleString()}</p>
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#1a3c5e', color: '#fff' }}>
                <tr>{['Member', 'Email', 'Total Paid', 'Yearly Target', 'Due'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {memberSummary.members.map((m, i) => (
                  <tr key={m.user_id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>{m.full_name}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{m.email}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#27ae60', fontWeight: 600 }}>৳ {m.total_paid.toLocaleString()}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>৳ {m.yearly_target.toLocaleString()}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: m.due > 0 ? '#e74c3c' : '#27ae60', fontWeight: 600 }}>
                      {m.due > 0 ? `৳ ${m.due.toLocaleString()}` : '✓ Completed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
