"use client";

interface InputFieldProps {
  label: string;
  type?: string;
  register: any;
  name: string;
  error?: string;
}

export default function InputField({
  label,
  type = "text",
  register,
  name,
  error,
}: InputFieldProps) {
  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type={type}
        {...register(name)}
        className="border px-3 py-2 w-full rounded"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
