export default function AdminDashboard() {
  return (
    <div className="text-black">
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard</h1>

      <div className="grid grid-cols-4 gap-4">
        <Card title="Tổng số Tours" value="12" />
        <Card title="Tours Sắp Khởi Hành" value="45" />
        <Card title="Tours Đang Hoạt Động" value="8" />
        <Card title="Tours Đã Hết Hạn" value="15" />
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}