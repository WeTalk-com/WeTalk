import { CreateModalProvider } from "@/app/_components/create/create-modal-provider";
import { LeftSidebar } from "@/app/_components/layout/left-sidebar";
import { MobileNav } from "@/app/_components/layout/mobile-nav";

/** Shell de l'app connectee : sidebar + zone centrale + nav mobile + modale Create. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreateModalProvider>
      <div className="min-h-dvh bg-canvas">
        <div className="mx-auto flex w-full max-w-[1240px]">
          <LeftSidebar />
          {children}
        </div>
        <MobileNav />
      </div>
    </CreateModalProvider>
  );
}
