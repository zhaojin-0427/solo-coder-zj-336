import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ open, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-up"
        onClick={onClose}
        style={{ animationDuration: "0.2s" }}
      />
      <div className="relative card-paper w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-fade-up" style={{ animationDuration: "0.25s" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-200/50">
          <h3 className="text-xl font-serif font-semibold text-ink-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-ink-50 text-ink-400 hover:text-ink-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-200/50 bg-paper/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
