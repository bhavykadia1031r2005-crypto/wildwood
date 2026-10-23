"use client";

import { useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useFocusTrap, useScrollLock } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Button, useMounted } from "../ui";

/** Centered modal dialog for the content editor (focus trapped, Escape closes). */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const panel = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  useFocusTrap(panel, open, onClose);
  useScrollLock(open);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="on-light fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="Close dialog"
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cms-dialog-title"
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white font-sans text-gray-900 shadow-2xl sm:rounded-2xl",
              size === "sm" ? "sm:max-w-md" : size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl",
            )}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
              <div className="min-w-0">
                <h2 id="cms-dialog-title" className="text-base font-semibold text-gray-900">
                  {title}
                </h2>
                {description && <div className="mt-0.5 text-[0.8rem] text-gray-500">{description}</div>}
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 shrink-0 place-items-center rounded-lg text-gray-500 hover:bg-gray-100">
                <X className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
            {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-5 py-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  tone = "danger",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            className={cn(tone === "danger" && "bg-coral-600 hover:bg-coral-700")}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-gray-600">{message}</div>
    </Dialog>
  );
}
