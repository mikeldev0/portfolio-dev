interface HighlightProps {
    children: React.ReactNode;
}

const Highlight = ({ children }: HighlightProps) => {
    return (
        <span
            className="font-bold text-indigo-600 dark:text-indigo-400"
        >
            {children}
        </span>
    );
};

export default Highlight;
