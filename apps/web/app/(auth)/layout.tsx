import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in · WeTalk",
  description: "Log in or create your WeTalk account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
