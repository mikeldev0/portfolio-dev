import React, { useEffect, useState } from "react";
import { GlassCard } from "@developer-hub/liquid-glass";

interface LiquidHeaderProps {
    children: React.ReactNode;
}

export default function LiquidHeader({ children }: LiquidHeaderProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 z-50 w-full transition-all duration-500 flex items-center ${scrolled ? "!h-16" : "h-20"}`}
            id="main-header"
        >
            <div className={`absolute inset-0 transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}>
                <GlassCard
                    className="w-full h-full bg-white/90 dark:bg-zinc-950/90"
                    displacementScale={20}
                    blurAmount={0.03}
                    shadowMode={false}
                    cornerRadius={0}
                >
                    <div className="w-full h-full"></div>
                </GlassCard>
            </div>
            
            <div className="relative w-full z-10">
                {children}
            </div>
        </header>
    );
}
