import { getCurrentUser } from "@/lib/api";
import { CreateModalProvider } from "@/components/create/create-modal-provider";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

/** Shell de l'app connectee : sidebar + zone centrale + nav mobile + modale Create. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <CreateModalProvider user={user}>
      <div className="min-h-dvh bg-canvas">
        <div className="mx-auto flex w-full max-w-[1240px]">
          <LeftSidebar user={user} />
          {children}
        </div>
        <MobileNav />
      </div>
    </CreateModalProvider>
  );
}
