export default function ChangePasswordPage() {
  return (
    <div className="max-w-md mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">Đổi mật khẩu</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">

        <input
          type="password"
          placeholder="Mật khẩu cũ"
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          className="w-full border p-2 rounded"
        />

        <button className="bg-blue-500 text-white px-6 py-2 rounded">
          Cập nhật
        </button>

      </div>

    </div>
  );
}