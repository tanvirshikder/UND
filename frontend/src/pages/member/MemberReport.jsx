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
      <h2 style={{ marginTop: 0, color: '#1a3c5e' }}>My Deposit Report</h2>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <input type="number" style={{ ...inputStyle, width: 120 }} value={year} onChange={e => setYear(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ background: '#fff', padding: '16px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #27ae60' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Total Paid ({year})</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#27ae60' }}>৳ {report.total.toLocaleString()}</p>
        </div>
        <div style={{ background: '#fff', padding: '16px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #1a3c5e' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Yearly Target</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a3c5e' }}>৳ {report.yearly_target.toLocaleString()}</p>
        </div>
        <div style={{ background: '#fff', padding: '16px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #e74c3c' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#666' }}>Due</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#e74c3c' }}>৳ {Math.max(0, report.yearly_target - report.total).toLocaleString()}</p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#1a3c5e', color: '#fff' }}>
            <tr>{['Type', 'Amount', 'Date', 'Month', 'Note'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13 }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {report.deposits.map((d, i) => (
              <tr key={d.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.deposit_type}</td>
                <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#27ae60' }}>৳ {d.amount.toLocaleString()}</td>
                <td style={{ padding: '10px 16px', fontSize: 13 }}>{d.deposit_date}</td>
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
