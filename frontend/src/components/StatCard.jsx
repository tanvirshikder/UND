export default function StatCard({ label, value, color = '#1a3c5e', sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: `4px solid ${color}` }}>
      <p style={{ margin: '0 0 6px', fontSize: 13, color: '#666' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color }}>{value}</p>
      {sub && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#999' }}>{sub}</p>}
    </div>
  );
}
