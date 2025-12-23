import { useHolidayEffectsActive } from "../lib/holiday";

interface Props {
        className?: string;
}

export default function HolidayProfileImage({ className }: Props) {
        const showHolidayHat = useHolidayEffectsActive();

        return (
                <div className={["relative", className].filter(Boolean).join(" ")}>
                        <img
                                className="rounded-full size-24 sm:size-32 object-cover object-center border-4 border-gray-200 dark:border-gray-800"
                                src="/photo.webp"
                                alt="Mikel Echeverria, Desarrollador Full Stack y Backend"
                                width={128}
                                height={128}
                                loading="eager"
                        />
                        {showHolidayHat && (
                                <img
                                        aria-hidden="true"
                                        className="absolute -top-10 left-1/2 -translate-x-1/2 sm:-top-12 sm:-translate-x-1/2 lg:-top-11 rotate-[-15deg] w-20 sm:w-24 drop-shadow-md"
                                        src="/TheresaKnott_Santa_Hat.svg"
                                        alt=""
                                />
                        )}
                </div>
        );
}
