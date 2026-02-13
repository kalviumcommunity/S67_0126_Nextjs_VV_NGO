"use client";

interface ToastProps {
  message: string;
}

export default function Toast({ message }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow-lg">
      {message}
    </div>
  );
}
