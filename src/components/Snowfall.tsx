import { useEffect, useRef } from "react";
import { useHolidayEffectsActive } from "../lib/holiday";

interface Snowflake {
        x: number;
        y: number;
        radius: number;
        speed: number;
        drift: number;
}

const SNOWFLAKE_COUNT = 120;
export default function Snowfall() {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const animationRef = useRef<number>();
        const isActive = useHolidayEffectsActive();

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

        if (!isActive) {
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
