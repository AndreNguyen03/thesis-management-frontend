import type { ReactNode } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DropdownItem = ({ children, className = "", ...props }: { children: ReactNode; className?: string; [key: string]: any }) => (
  <div className={`px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer ${className}`} {...props}>
    {children}
  </div>
);