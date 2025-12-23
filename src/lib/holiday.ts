import { useEffect, useState } from "react";
import { env } from "./env";

const HOLIDAY_END_DAY = 7;

export const isWithinHolidaySeason = (date: Date) => {
        const month = date.getMonth();
        const day = date.getDate();

        return month === 11 || (month === 0 && day <= HOLIDAY_END_DAY);
};

export const useHolidayEffectsActive = () => {
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

        return isActive;
};
