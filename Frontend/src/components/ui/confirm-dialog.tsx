import * as Dialog from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
        />

        {/* Content */}
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border p-6 shadow-2xl backdrop-blur-xl transition-all duration-300",
            "bg-white/20 dark:bg-white/10",
            "border-white/30 dark:border-white/10",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          )}
        >
          {/* Gradient Glow */}
          <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-indigo-500/10 via-pink-500/10 to-cyan-400/10 opacity-50 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 space-y-4">
            <Dialog.Title className="text-lg font-semibold">
              {title}
            </Dialog.Title>

            {description && (
              <Dialog.Description className="text-sm text-muted-foreground">
                {description}
              </Dialog.Description>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Dialog.Close asChild>
                <button className="btn-glass px-4 py-2 text-sm">
                  Cancel
                </button>
              </Dialog.Close>

              <button
                onClick={() => {
                  onConfirm()
                  onOpenChange(false)
                }}
                className="btn-gradient px-4 py-2 text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}