"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/schemas/authSchema";
import InputField from "@/components/forms/InputField";
import { useUIContext } from "@/context/UIContext";

export default function LoginPage() {
  const { showToast } = useUIContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    console.log("Login Data:", data);
    showToast("Login successful");
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label="Email"
          name="email"
          register={register}
          error={errors.email?.message}
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          register={register}
          error={errors.password?.message}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      </form>
    </main>
  );
}
