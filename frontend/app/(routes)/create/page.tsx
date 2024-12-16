import Create from "@/components/Create";
import { Metadata } from "next";

// No plans currently may work on it finally
export const metadata: Metadata = {
  title: "Upload",
  description: "Upload media to the internet",
};

export default function Page() {
  return <Create />;
}