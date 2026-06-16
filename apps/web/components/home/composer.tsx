import { useTranslations } from "next-intl";
import { ImageIcon } from "lucide-react";
import type { User } from "@/lib/types";
import { Avatar } from "../ui/avatar";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { IconButton } from "../ui/icon-button";

export function Composer({ user }: { user: User }) {
  const t = useTranslations("app.composer");
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar initial={user.initial} solid />
        <input
          type="text"
          placeholder={t("placeholder", { name: firstName })}
          aria-label={t("ariaCreate")}
          className="min-w-0 flex-1 bg-transparent text-lg text-brown outline-none placeholder:text-placeholder"
        />
        <IconButton label={t("addImage")}>
          <ImageIcon className="size-5" />
        </IconButton>
        <Button className="shrink-0">{t("post")}</Button>
      </div>
    </Card>
  );
}
