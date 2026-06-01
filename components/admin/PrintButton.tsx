"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ label = "Imprimer l'affiche" }: { label?: string }) {
  return (
    <Button type="button" onClick={() => window.print()}>
      <Printer aria-hidden className="h-4 w-4" />
      {label}
    </Button>
  );
}
