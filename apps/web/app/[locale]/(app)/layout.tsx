import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api";
import { ApiError } from "@/lib/api/client";
import { CreateModalProvider } from "@/components/create/create-modal-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { TooltipProvider } from "@/components/ui/tooltip-provider";
import { LeftSidebar } from "@/components/layout/left-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SessionWatcher } from "@/components/auth/session-watcher";

/** Shell de l'app connectee : sidebar + zone centrale + nav mobile + modale Create. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getCurrentUser();
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
      redirect("/login");
    }
    throw err;
  }

  return (
    <TooltipProvider>
    <CreateModalProvider user={user}>
      <ToastProvider>
      <SessionWatcher />
      <div className="min-h-dvh bg-canvas">
        <div className="mx-auto flex w-full max-w-[1240px]">
          <LeftSidebar user={user} />
          {children}
        </div>
        <MobileNav />
      </div>
      </ToastProvider>
    </CreateModalProvider>
    </TooltipProvider>
  );
}
