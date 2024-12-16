import AuthPage from "@/components/Auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Authentication page",
};


export default function LoginPage() {

  return <AuthPage mode={'login'} />;
}