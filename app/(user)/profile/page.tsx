export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Thông tin cá nhân</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">

        <div>
          <label className="font-medium">Họ tên</label>
          <input
            type="text"
            className="w-full border p-2 rounded mt-1"
            defaultValue="Nguyễn Văn A"
          />
        </div>

        <div>
          <label className="font-medium">Email</label>
          <input
            type="email"
            className="w-full border p-2 rounded mt-1"
            defaultValue="user@gmail.com"
          />
        </div>

        <button className="bg-blue-500 text-white px-6 py-2 rounded">
          Cập nhật
        </button>

      </div>
    </div>
  );
}