import type React from "react";

interface HeaderCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HeaderCard({ children, className = "" }: HeaderCardProps) {
  return <div className={`header-card ${className}`}>{children}</div>;
}


