import type { Metadata, Viewport } from "next";
import { LoginView } from "@/views/LoginView";

export const metadata: Metadata = { title: "Entrar" };
export const viewport: Viewport = { themeColor: "#ffa60c" };

export default function LoginPage() {
  return <LoginView />;
}
