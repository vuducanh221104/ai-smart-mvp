"use client";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConvertButtonProps {
  onClick: () => void;
  disabled: boolean;
  isConverting: boolean;
}

export function ConvertButton({ onClick, disabled, isConverting }: ConvertButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} className="convert-button" size="lg">
      <Download size={20} />
      {isConverting ? "Converting..." : "Convert"}
    </Button>
  );
}


