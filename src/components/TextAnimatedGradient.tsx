interface TextAnimatedGradientProps {
    children: React.ReactNode;
    fontSize?: string;
}

const TextAnimatedGradient = ({ children, fontSize }: TextAnimatedGradientProps) => {
    return (
        <span
            className={`inline-flex font-semibold text-indigo-700 dark:text-indigo-300 ${fontSize === "inherit" ? "" : "text-xl"}`}
        >
            {children}
        </span>
    );
};

export default TextAnimatedGradient;
