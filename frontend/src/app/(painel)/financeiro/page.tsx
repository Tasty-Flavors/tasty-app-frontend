import type { Metadata } from "next";
import { FinanceiroView } from "@/views/FinanceiroView";

export const metadata: Metadata = { title: "Financeiro" };

export default function Page() {
  return <FinanceiroView />;
}
