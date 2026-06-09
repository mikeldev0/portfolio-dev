interface HighlightProps {
    children: React.ReactNode;
}

const Highlight = ({ children }: HighlightProps) => {
    return (
        <span
            className="font-bold text-zinc-900 dark:text-zinc-100"
        >
            {children}
        </span>
    );
};

export default Highlight;
