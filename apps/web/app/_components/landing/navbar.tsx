import Link from "next/link";
import { Button } from "../ui/button";

const NAV_LINKS = ["Discover", "Creators", "Live", "About"];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-border bg-canvas/80 backdrop-blur">
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-5">
        <span className="font-head text-[28px] font-extrabold italic text-brown">
          WeeTalk
        </span>
        <ul className="hidden items-center gap-8 text-sm font-medium text-brown-sec md:flex">
          {NAV_LINKS.map((l) => (
            <li key={l}>
              <a href="#" className="transition-colors hover:text-gold">
                {l}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-brown transition-colors hover:text-gold"
          >
            Log in
          </Link>
          <Button href="/login" size="sm">
            Get started
          </Button>
        </div>
      </nav>
    </header>
  );
}
