"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { useEscapeKey } from "@/lib/use-escape-key";

/**
 * Confirmation for an action that cannot be undone.
 *
 * The friction is proportional to the damage. An ordinary delete needs
 * one deliberate click; something that erases the whole table asks the
 * admin to type the phrase out, so it can never be reached by muscle
 * memory or a mis-aimed tap on a phone.
 *
 * The confirm button is not the default focus and Escape always cancels,
 * because the safe outcome should be the easy one.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  requirePhrase,
  phraseHint,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  /** When set, the admin must type this exactly before confirming. */
  requirePhrase?: string;
  phraseHint?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");

  useScrollLock(open);
  useEscapeKey(open && !busy, onCancel);

  // Clear the typed phrase whenever the dialog opens, so a previous
  // confirmation can't carry over and pre-arm the button. Adjusted
  // during render on a changing value — React's own pattern for this,
  // and what admin-shell does to close its drawer on navigation.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setTyped("");
  }

  const ready = !requirePhrase || typed.trim() === requirePhrase;

  return (
    <AnimatePresence>
      {open && [
        <motion.div
          key="confirm-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-ink/50 backdrop-blur-[2px]"
          onClick={busy ? undefined : onCancel}
        />,
        <motion.div
          key="confirm-panel"
          role="alertdialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="fixed inset-x-4 top-1/2 z-[121] mx-auto w-auto max-w-md -translate-y-1/2 overflow-hidden rounded-2xl bg-surface shadow-2xl sm:inset-x-0"
        >
          <div className="flex gap-3 p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-mist">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-deep" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-lg font-bold text-ink">{title}</h2>
              <p className="mt-1 text-sm text-ink-soft">{body}</p>

              {requirePhrase && (
                <div className="mt-3">
                  <p className="text-xs text-ink-soft">{phraseHint}</p>
                  <input
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    dir="ltr"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={requirePhrase}
                    className="mt-1.5 w-full min-w-0 rounded-lg border border-line bg-cream-soft px-3 py-2 font-mono text-sm text-ink outline-none focus:border-rose-deep"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-line bg-cream-soft p-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!ready || busy}
              className="rounded-full bg-rose-deep px-5 py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-40"
            >
              {busy ? "…" : confirmLabel}
            </button>
          </div>
        </motion.div>,
      ]}
    </AnimatePresence>
  );
}
