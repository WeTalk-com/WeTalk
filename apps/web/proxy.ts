import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Applique le proxy a tout sauf les assets internes et les fichiers.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
