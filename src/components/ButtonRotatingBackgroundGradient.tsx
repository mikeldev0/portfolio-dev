interface ButtonRotatingBackgroundGradient {
    children: React.ReactNode;
}

const ButtonRotatingBackgroundGradient: React.FC<ButtonRotatingBackgroundGradient> = ({ children }) => {
    return (
        <span
            aria-hidden="true"
            className="inline-flex min-h-11 rounded-full border border-zinc-300 bg-white text-zinc-800 transition-colors duration-200 hover:border-indigo-400 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
        >
            <span className="inline-flex h-full w-full items-center justify-center px-3 py-2 text-sm font-medium">
                <div className="flex gap-x-2 items-center">{children}</div>
            </span>
        </span>
    );
};

export default ButtonRotatingBackgroundGradient;
