import type { Metadata } from "next";
import { FeedView } from "@/views/FeedView";

export const metadata: Metadata = { title: "Feed" };

export default function Page() {
  return <FeedView />;
}
