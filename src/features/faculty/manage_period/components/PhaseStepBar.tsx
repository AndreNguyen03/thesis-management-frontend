import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Phase } from "@/models/period";

interface PhaseStepBarProps {
  phases: Phase[];
  currentPhase: number;
  onPhaseChange: (phase: number) => void;
}

export function PhaseStepBar({
  phases,
  currentPhase,
  onPhaseChange,
}: PhaseStepBarProps) {
  return (
    <div className="relative flex flex-col items-center py-8 px-6">
      {phases.map((phase) => {
        const isActive = currentPhase === phase.id;
        const isCompleted = phase.status === "completed";
        const isClickable = phase.status !== "inactive";

        return (
          <div key={phase.id} className="relative flex flex-col items-center">
            {/* Step circle */}
            <motion.button
              onClick={() => isClickable && onPhaseChange(phase.id)}
              disabled={!isClickable}
              className={cn(
                "relative flex items-center justify-center w-14 h-14 rounded-full border-2 shadow-md transition-all duration-300 z-10",
                isCompleted &&
                  "bg-gradient-to-br from-success to-success/80 border-success",
                isActive &&
                  "bg-gradient-to-br from-primary to-primary/80 border-primary shadow-lg shadow-primary/30",
                !isActive && !isCompleted && "bg-card border-step-inactive",
                isClickable && "hover:scale-110 active:scale-95",
                !isClickable && "cursor-not-allowed opacity-50"
              )}
              whileHover={isClickable ? { scale: 1.08 } : {}}
              whileTap={isClickable ? { scale: 0.95 } : {}}
            >
              {isCompleted ? (
                <Check className="w-7 h-7 text-white" />
              ) : (
                <Circle
                  className={cn(
                    "w-7 h-7",
                    isActive ? "text-white" : "text-muted-foreground"
                  )}
                />
              )}

              {/* Hiệu ứng nhịp đập */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/40"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>

            {/* Step label */}
            <div className="mt-3 mb-10 text-center flex flex-col items-center">
              <p
                className={cn(
                  "text-sm font-semibold whitespace-nowrap",
                  isActive && "text-primary",
                  isCompleted && "text-success",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                Pha {phase.id}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[100px] leading-tight">
                {phase.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
