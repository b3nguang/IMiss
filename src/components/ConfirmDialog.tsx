import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  detail?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  detail,
  confirmText = "确认",
  cancelText = "取消",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmButtonClass =
    variant === "danger"
      ? "bg-red-50 text-red-700 border border-red-200 hover:border-red-300"
      : "bg-yellow-50 text-yellow-700 border border-yellow-200 hover:border-yellow-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 p-5">
        <div className="text-lg font-semibold text-gray-900 mb-2">{title}</div>
        <div className={`text-sm text-gray-700 mb-4 ${detail ? "space-y-2" : ""}`}>
          <div>{message}</div>
          {detail && <div className="text-xs text-gray-500 break-all">{detail}</div>}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 text-sm rounded-lg bg-white border border-gray-200 hover:border-gray-300 text-gray-700"
          >
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`px-3 py-2 text-sm rounded-lg ${confirmButtonClass}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
