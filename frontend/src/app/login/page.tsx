import type { Metadata } from "next";
import { LoginView } from "@/views/LoginView";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return <LoginView />;
}
