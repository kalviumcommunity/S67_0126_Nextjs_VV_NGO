"use client";

import Toast from "./Toast";
import { useUIContext } from "@/context/UIContext";

export default function ToastContainer() {
  const { toastMessage } = useUIContext();

  if (!toastMessage) return null;

  return <Toast message={toastMessage} />;
}
