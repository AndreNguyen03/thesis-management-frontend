import { useCallback, useRef } from "react";
interface UseDebounceProps {
  onChange: (val: string) => void;
  duration: number;
}
export function useDebounce({onChange, duration}: UseDebounceProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onEdit = useCallback(
    (val:string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => onChange(val), duration);
    },
    [duration, onChange]
  );
  return onEdit;
}