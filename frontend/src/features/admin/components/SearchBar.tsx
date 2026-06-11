import { Search, X } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export const SearchBar = ({
  placeholder = "Buscar...",
  value,
  onChange,
  onClear,
  className = "",
}: SearchBarProps) => {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={`relative group ${className}`}>
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/30 group-focus-within:text-[#3A4A3F] dark:group-focus-within:text-[#C8A97E] transition-colors pointer-events-none"
        size={16}
        strokeWidth={1.5}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2.5 bg-transparent border border-[#EDEDED] dark:border-white/10 outline-none text-sm text-[#111111] dark:text-white placeholder:text-[#2B2B2B]/30 dark:placeholder:text-white/25 focus:border-[#3A4A3F] dark:focus:border-[#C8A97E] transition-all rounded-none"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          title="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 dark:text-white/30 hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <X size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  );
};
