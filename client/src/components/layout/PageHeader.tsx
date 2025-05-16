import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="bg-muted/30 border-b">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <h1 className="heading text-3xl md:text-4xl font-bold text-foreground mb-2">{title}</h1>
        {subtitle && <p className="text-muted-foreground max-w-2xl mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}