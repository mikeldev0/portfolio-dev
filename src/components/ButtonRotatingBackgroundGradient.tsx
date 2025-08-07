interface ButtonRotatingBackgroundGradient {
    children: React.ReactNode; // Utiliza children para pasar contenido
}

const ButtonRotatingBackgroundGradient: React.FC<ButtonRotatingBackgroundGradient> = ({ children }) => {
    return (
        <span
            aria-hidden="true"
            className='relative inline-flex h-12 overflow-hidden rounded-full p-[1px]'
        >
            <span className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]' />
            <span className='inline-flex h-full w-full items-center justify-center rounded-full dark:bg-gray-950 px-3 py-1 text-sm font-medium dark:text-gray-50 backdrop-blur-3xl transition-all duration-300 dark:hover:bg-gray-900 hover:bg-gray-200 shadow-lg shadow-indigo-500/40 bg-neutral-100 text-neutral-600 shadow-light-3 hover:bg-neutral-200 hover:shadow-light-2 active:bg-neutral-200 active:shadow-light-2'>
                <div className="flex gap-x-2 items-center">{children}</div>
            </span>
        </span>
    );
};

export default ButtonRotatingBackgroundGradient;
