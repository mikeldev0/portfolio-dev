import { useEffect, useRef, useState } from "react";
import { env } from "../lib/env";

interface Snowflake {
        x: number;
        y: number;
        radius: number;
        speed: number;
        drift: number;
}

const SNOWFLAKE_COUNT = 120;
const HOLIDAY_END_DAY = 7;

const isWithinHolidaySeason = (date: Date) => {
        const month = date.getMonth();
        const day = date.getDate();

        return month === 11 || (month === 0 && day <= HOLIDAY_END_DAY);
};

export default function Snowfall() {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const animationRef = useRef<number>();
        const [isActive, setIsActive] = useState(false);
        const { enableHolidayEffects } = env;

        useEffect(() => {
                const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
                const updateSeasonalState = () => {
                        const holidayActive = isWithinHolidaySeason(new Date());
                        setIsActive(enableHolidayEffects && holidayActive && !prefersReducedMotion.matches);
                };

                updateSeasonalState();
                prefersReducedMotion.addEventListener("change", updateSeasonalState);

                return () => {
                        prefersReducedMotion.removeEventListener("change", updateSeasonalState);
                };
        }, [enableHolidayEffects]);

        useEffect(() => {
                if (!isActive) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext("2d");
                if (!context) return;

                const snowflakes: Snowflake[] = [];

                const resize = () => {
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                };

                const createSnowflakes = () => {
                        snowflakes.length = 0;
                        for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
                                snowflakes.push({
                                        x: Math.random() * canvas.width,
                                        y: Math.random() * canvas.height,
                                        radius: 1.5 + Math.random() * 2,
                                        speed: 0.5 + Math.random() * 1.5,
                                        drift: (Math.random() - 0.5) * 0.6,
                                });
                        }
                };

                const draw = () => {
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.fillStyle = "rgba(255, 255, 255, 0.85)";
                        context.shadowColor = "rgba(255, 255, 255, 0.9)";
                        context.shadowBlur = 6;

                        for (const flake of snowflakes) {
                                context.beginPath();
                                context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
                                context.fill();

                                flake.y += flake.speed;
                                flake.x += flake.drift;

                                if (flake.y > canvas.height) {
                                        flake.y = -flake.radius;
                                        flake.x = Math.random() * canvas.width;
                                }
                                if (flake.x > canvas.width) flake.x = 0;
                                if (flake.x < 0) flake.x = canvas.width;
                        }

                        animationRef.current = requestAnimationFrame(draw);
                };

                const handleResize = () => {
                        resize();
                        createSnowflakes();
                };

                resize();
                createSnowflakes();
                draw();

                window.addEventListener("resize", handleResize);

                return () => {
                        if (animationRef.current) cancelAnimationFrame(animationRef.current);
                        window.removeEventListener("resize", handleResize);
                };
        }, [isActive]);

        if (!enableHolidayEffects || !isActive) {
                return null;
        }

        return (
                <canvas
                        ref={canvasRef}
                        aria-hidden="true"
                        className="pointer-events-none fixed inset-0 z-[-1] mix-blend-screen opacity-80"
                />
        );
}
