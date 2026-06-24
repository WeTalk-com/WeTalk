export function Navbar() {
  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-border bg-canvas/80 backdrop-blur">
      <nav className="mx-auto flex h-full max-w-6xl items-center gap-2 px-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" aria-hidden className="h-9 w-auto" />
        <span className="font-head text-[28px] font-extrabold italic text-brown">
          WeTalk
        </span>
      </nav>
    </header>
  );
}
