"use client";

import { Trash2 } from "lucide-react";
import { deleteBusinessAction } from "@/app/actions/business";
import { Button } from "@/components/ui/button";

export function DeleteBusinessButton({
  businessId,
  businessName,
  size = "sm",
}: {
  businessId: string;
  businessName: string;
  size?: "sm" | "md";
}) {
  return (
    <form
      action={deleteBusinessAction}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `Supprimer définitivement ${businessName} ? Ses clients, cartes et transactions seront aussi supprimés.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="businessId" value={businessId} />
      <Button type="submit" size={size} variant="danger">
        <Trash2 aria-hidden className="h-4 w-4" />
        Supprimer
      </Button>
    </form>
  );
}
