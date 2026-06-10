import type { Metadata } from "next";
import { Landing } from "./_components/landing/landing";

export const metadata: Metadata = {
  title: "WeTalk — The warm side of social",
  description:
    "Share your golden hours, follow people you actually like, and talk slower. WeTalk is the feed that feels good to come back to.",
  openGraph: {
    title: "WeTalk — The warm side of social",
    description:
      "A calmer, warmer photo network. Follow fewer, talk more.",
    type: "website",
  },
};

export default function Page() {
  return <Landing />;
}
