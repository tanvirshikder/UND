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
    api.get('/api/reports/expenses-summary', { params: filters.year ? { year: filters.year } : {} }).then(r => setExpenseReport(r.data));
  };
  const loadMemberSummary = () => {
    api.get('/api/reports/member-summary', { params: filters.year ? { year: filters.year } : {} }).then(r => setMemberSummary(r.data));
  };

  useEffect(() => {
    if (tab === 'deposits') loadDeposits();
    else if (tab === 'expenses') loadExpenses();
    else loadMemberSummary();
  }, [tab, filters]);

  const tabStyle = active => ({ padding: '8px 16px', border: 'none', cursor: 'pointer', borderBottom: active ? '3px solid #1a3c5e' : '3px solid transparent', background: 'none', fontWeight: active ? 700 : 400, color: active ? '#1a3c5e' : '#666', fontSize: 14, whiteSpace: 'nowrap' });

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#1a3c5e', marginBottom: 16 }}>Reports</h2>

      <div style={{ borderBottom: '1px solid #ddd', marginBottom: 20, overflowX: 'auto', display: 'flex' }}>
        <button className="tab-btn" style={tabStyle(tab === 'deposits')} onClick={() => setTab('deposits')}>Deposit Report</button>
        <button className="tab-btn" style={tabStyle(tab === 'expenses')} onClick={() => setTab('expenses')}>Expense Report</button>
        <button className="tab-btn" style={tabStyle(tab === 'members')} onClick={() => setTab('members')}>Member Summary</button>
      </div>

      <div className="filter-bar">
        <input type="number" placeholder="Year" style={inputStyle} value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })} />
        {tab === 'deposits' && (
          <select style={inputStyle} value={filters.user_id} onChange={e => setFilters({ ...filters, user_id: e.target.value })}>
            <option value="">All Members</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
          </select>
        )}
      </div>

      {tab === 'deposits' && depositReport && (
        <div>
          <div className="summary-row">
            <div className="summary-card" style={{ borderLeft: '4px solid #27ae60' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Total Collected</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#27ae60' }}>৳ {depositReport.total.toLocaleString()}</p>
            </div>
            <div className="summary-card" style={{ borderLeft: '4px solid #1a3c5e' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Yearly Target / Member</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a3c5e' }}>৳ {depositReport.yearly_target.toLocaleString()}</p>
            </div>
          </div>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#1a3c5e', color: '#fff' }}>
                <tr>{['Member', 'Type', 'Amount', 'Date', 'Year', 'Month', 'Note'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {depositReport.deposits.map((d, i) => (
                  <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    <td style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>{d.user_name}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.deposit_type}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>৳ {d.amount.toLocaleString()}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>{d.deposit_date}</td>
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
          <div className="summary-row">
            <div className="summary-card" style={{ borderLeft: '4px solid #e74c3c' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Total Expenses</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e74c3c' }}>৳ {expenseReport.total.toLocaleString()}</p>
            </div>
            {Object.entries(expenseReport.by_category).map(([cat, amt]) => (
              <div key={cat} className="summary-card" style={{ borderLeft: '4px solid #f39c12' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#666' }}>{cat}</p>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f39c12' }}>৳ {amt.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#1a3c5e', color: '#fff' }}>
                <tr>{['Title', 'Amount', 'Date', 'Category', 'Note'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {expenseReport.expenses.map((e, i) => (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{e.title}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#e74c3c', whiteSpace: 'nowrap' }}>৳ {e.amount.toLocaleString()}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>{e.expense_date}</td>
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
          <p style={{ color: '#666', marginBottom: 12, fontSize: 13 }}>Year: {memberSummary.year} | Target/Member: ৳ {memberSummary.yearly_target.toLocaleString()}</p>
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#1a3c5e', color: '#fff' }}>
                <tr>{['Member', 'Email', 'Total Paid', 'Target', 'Due'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {memberSummary.members.map((m, i) => (
                  <tr key={m.user_id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{m.full_name}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{m.email}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#27ae60', fontWeight: 600, whiteSpace: 'nowrap' }}>৳ {m.total_paid.toLocaleString()}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>৳ {m.yearly_target.toLocaleString()}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: m.due > 0 ? '#e74c3c' : '#27ae60', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {m.due > 0 ? `৳ ${m.due.toLocaleString()}` : '✓ Done'}
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
