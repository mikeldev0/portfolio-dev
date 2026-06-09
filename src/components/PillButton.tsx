interface PillButtonProps {
  children: React.ReactNode;
}

const PillButton: React.FC<PillButtonProps> = ({ children }) => {
  return (
    <span
      aria-hidden="true"
      className="inline-flex min-h-10 rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
    >
      <span className="inline-flex h-full w-full items-center justify-center px-4 py-2 text-sm font-semibold">
        <div className="flex gap-x-2 items-center">{children}</div>
      </span>
    </span>
  );
};

export default PillButton;
