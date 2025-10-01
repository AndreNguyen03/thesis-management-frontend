import type { CardProps } from "./CardHeader";

export const CardTitle = ({ children, className }: CardProps) => (
  <h3 className={`font-semibold text-lg ${className || ""}`}>{children}</h3>
);