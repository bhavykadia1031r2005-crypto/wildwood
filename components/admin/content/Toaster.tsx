"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; message: string; tone: "success" | "error"; action?: { label: string; run: () => void } };
type ToastInput = Omit<Toast, "id" | "tone"> & { tone?: Toast["tone"] };

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

/** Small toast stack for save / delete / undo feedback in the content editor. */
export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-2), { tone: "success", ...input, id }]);
      window.setTimeout(() => dismiss(id), input.action ? 7000 : 4000);
    },
    [dismiss],
  );
  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:w-96">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
              role={t.tone === "error" ? "alert" : "status"}
              className="pointer-events-auto flex w-full items-start gap-2.5 rounded-xl bg-gray-900 px-3.5 py-3 text-sm text-white shadow-xl"
            >
              {t.tone === "error" ? (
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-coral-400" aria-hidden="true" />
              ) : (
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-turquoise-400" aria-hidden="true" />
              )}
              <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action!.run();
                    dismiss(t.id);
                  }}
                  className={cn("shrink-0 rounded-md px-2 py-0.5 font-semibold text-sun-400 hover:bg-white/10")}
                >
                  {t.action.label}
                </button>
              )}
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="-mr-1 grid size-6 shrink-0 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white">
                <X className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const push = useContext(ToastContext);
  if (!push) throw new Error("useToast must be used inside <Toaster>");
  return push;
}
