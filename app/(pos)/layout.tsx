import { ReactNode } from "react";

interface POSLayoutProps {
  children: ReactNode;
}

export default function POSLayout({ children }: POSLayoutProps) {
  return <div className="h-screen overflow-hidden">{children}</div>;
}
