import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  colSpan?: number;
  variant?: "table" | "page";
}

/** Inline table empty state — wrap in a <tr><td colSpan={n}> */
export const EmptyStateRow = ({
  icon: Icon,
  title,
  description,
  colSpan = 8,
}: Omit<EmptyStateProps, "variant" | "action">) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-20 text-center">
      <div className="flex flex-col items-center gap-5">
        <div className="w-16 h-16 bg-[#EDEDED] dark:bg-white/5 flex items-center justify-center">
          <Icon size={28} className="text-[#2B2B2B]/20 dark:text-white/20" strokeWidth={1.2} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-light text-[#111111] dark:text-white">{title}</p>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/30 dark:text-white/30">
            {description}
          </p>
        </div>
      </div>
    </td>
  </tr>
);

/** Full-page / section empty state */
export const EmptyStateBlock = ({
  icon: Icon,
  title,
  description,
  action,
}: Omit<EmptyStateProps, "variant" | "colSpan">) => (
  <div className="flex flex-col items-center justify-center py-24 gap-6">
    <div className="w-20 h-20 bg-[#EDEDED] dark:bg-white/5 flex items-center justify-center">
      <Icon size={36} className="text-[#2B2B2B]/15 dark:text-white/15" strokeWidth={1} />
    </div>
    <div className="text-center space-y-2 max-w-xs">
      <p className="text-base font-light text-[#111111] dark:text-white">{title}</p>
      <p className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/30 dark:text-white/30 leading-relaxed">
        {description}
      </p>
    </div>
    {action && (
      <button
        onClick={action.onClick}
        className="mt-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#3A4A3F] dark:hover:bg-[#EDEDED] transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);
