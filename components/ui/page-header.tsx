// components/ui/page-header.tsx
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  heading: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  heading,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
