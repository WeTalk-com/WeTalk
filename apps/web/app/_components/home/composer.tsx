import { ImageIcon } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { IconButton } from "../ui/icon-button";
import { currentUser } from "@/lib/mock-data";

export function Composer() {
  const firstName = currentUser.name.split(" ")[0];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar initial={currentUser.initial} solid />
        <input
          type="text"
          placeholder={`Share something warm, ${firstName}...`}
          aria-label="Create a post"
          className="min-w-0 flex-1 bg-transparent text-lg text-brown outline-none placeholder:text-placeholder"
        />
        <IconButton label="Add an image">
          <ImageIcon className="size-5" />
        </IconButton>
        <Button className="shrink-0">Post</Button>
      </div>
    </Card>
  );
}
