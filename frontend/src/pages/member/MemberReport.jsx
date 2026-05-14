import { useEffect, useState } from 'react';
import api from '../../api/axios';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const inputStyle = { padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: '100%', boxSizing: 'border-box' };

export default function MemberReport() {
  const [report, setReport] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    api.get('/api/reports/deposits', { params: { year } }).then(r => setReport(r.data));
  }, [year]);

  if (!report) return <p>Loading...</p>;

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#1a3c5e', marginBottom: 16 }}>My Deposit Report</h2>

      <div style={{ marginBottom: 16, maxWidth: 160 }}>
        <label style={{ fontSize: 12, color: '#555', display: 'block', marginBottom: 4 }}>Year</label>
        <input type="number" style={inputStyle} value={year} onChange={e => setYear(e.target.value)} />
      </div>

      <div className="summary-row" style={{ marginBottom: 20 }}>
        <div className="summary-card" style={{ borderLeft: '4px solid #27ae60' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Total Paid ({year})</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#27ae60' }}>৳ {report.total.toLocaleString()}</p>
        </div>
        <div className="summary-card" style={{ borderLeft: '4px solid #1a3c5e' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Yearly Target</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a3c5e' }}>৳ {report.yearly_target.toLocaleString()}</p>
        </div>
        <div className="summary-card" style={{ borderLeft: '4px solid #e74c3c' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Due</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e74c3c' }}>৳ {Math.max(0, report.yearly_target - report.total).toLocaleString()}</p>
        </div>
      </div>

      <div className="table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#1a3c5e', color: '#fff' }}>
            <tr>{['Type', 'Amount', 'Date', 'Month', 'Note'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {report.deposits.map((d, i) => (
              <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.deposit_type}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#27ae60', whiteSpace: 'nowrap' }}>৳ {d.amount.toLocaleString()}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>{d.deposit_date}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.month ? months[d.month - 1] : '-'}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {report.deposits.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: 20 }}>No deposits for this year</p>}
      </div>
    </div>
  );
}
