import type React from "react";

interface ConverterCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ConverterCard({ children, className = "" }: ConverterCardProps) {
  return <div className={`converter-card ${className}`}>{children}</div>;
}


