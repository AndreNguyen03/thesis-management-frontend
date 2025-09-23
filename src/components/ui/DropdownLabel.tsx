import type { ReactNode } from "react";

export const DropdownLabel = ({ children }: { children: ReactNode }) => (
  <div className="px-4 py-2 text-sm font-medium">{children}</div>
);
