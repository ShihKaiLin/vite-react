import React from "react";

export default function LoginModal({
  show,
  password,
  setPassword,
  onLogin,
  onClose,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full">
        <h3 className="text-2xl font-bold mb-6">管理員驗證</h3>
        <input
          type="password"
          placeholder="請輸入密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLogin()}
          className="w-full border p-3 rounded-xl mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-slate-100 rounded-xl"
          >
            取消
          </button>
          <button
            onClick={onLogin}
            className="flex-1 p-3 bg-primary text-white rounded-xl"
          >
            登入
          </button>
        </div>
      </div>
    </div>
  );
}
