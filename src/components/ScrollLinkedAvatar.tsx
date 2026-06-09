import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHolidayEffectsActive } from "../lib/holiday";

const HERO_ANCHOR_SELECTOR = "#hero-avatar-anchor";
const HEADER_ANCHOR_SELECTOR = "#header-avatar-anchor";
const HEADER_COMPACT_HEIGHT = 64;
const DOCK_SCROLL_THRESHOLD = 36;
const UNDOCK_SCROLL_THRESHOLD = 8;

type AvatarBox = {
  left: number;
  top: number;
  size: number;
};

const spring = {
  type: "spring" as const,
  stiffness: 170,
  damping: 24,
  mass: 0.75,
};

function getAnchorBox(element: Element, scrollY = window.scrollY): AvatarBox {
  const rect = element.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);

  return {
    left: rect.left + (rect.width - size) / 2,
    top: rect.top + scrollY + (rect.height - size) / 2,
    size,
  };
}

function getCompactHeaderBox(element: Element): AvatarBox {
  const rect = element.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height);

  return {
    left: rect.left + (rect.width - size) / 2,
    top: (HEADER_COMPACT_HEIGHT - size) / 2,
    size,
  };
}

export default function ScrollLinkedAvatar() {
  const prefersReducedMotion = useReducedMotion();
  const showHolidayHat = useHolidayEffectsActive();
  const [heroBox, setHeroBox] = useState<AvatarBox | null>(null);
  const [headerBox, setHeaderBox] = useState<AvatarBox | null>(null);
  const [isDocked, setIsDocked] = useState(false);
  const hasPlacedAvatar = useRef(false);

  const left = useMotionValue(0);
  const top = useMotionValue(0);
  const size = useMotionValue(0);
  const borderRadius = useMotionValue(28);
  const imageScale = useMotionValue(1);
  const opacity = useMotionValue(0);

  const measureAnchors = useCallback(() => {
    const heroAnchor = document.querySelector(HERO_ANCHOR_SELECTOR);
    const headerAnchor = document.querySelector(HEADER_ANCHOR_SELECTOR);

    if (!heroAnchor || !headerAnchor) return;

    setHeroBox(getAnchorBox(heroAnchor));
    setHeaderBox(getCompactHeaderBox(headerAnchor));
  }, []);

  useEffect(() => {
    measureAnchors();

    window.addEventListener("resize", measureAnchors);
    window.addEventListener("load", measureAnchors);

    return () => {
      window.removeEventListener("resize", measureAnchors);
      window.removeEventListener("load", measureAnchors);
    };
  }, [measureAnchors]);

  const isReady = Boolean(heroBox && headerBox && !prefersReducedMotion);

  useEffect(() => {
    document.documentElement.classList.toggle("scroll-avatar-ready", isReady);

    return () => {
      document.documentElement.classList.remove("scroll-avatar-ready");
    };
  }, [isReady]);

  const start = heroBox ?? { left: 0, top: 0, size: 0 };
  const end = headerBox ?? start;

  useEffect(() => {
    if (!isReady) return;
    if (hasPlacedAvatar.current) return;

    left.set(isDocked ? end.left : start.left);
    top.set(isDocked ? end.top : start.top);
    size.set(isDocked ? end.size : start.size);
    borderRadius.set(isDocked ? 999 : 28);
    imageScale.set(isDocked ? 0.98 : 1);
    opacity.set(isDocked ? 0.96 : 1);
    hasPlacedAvatar.current = true;
  }, [
    borderRadius,
    end.left,
    end.size,
    end.top,
    imageScale,
    isDocked,
    isReady,
    left,
    opacity,
    size,
    start.left,
    start.size,
    start.top,
    top,
  ]);

  useEffect(() => {
    if (!isReady) return;

    const handleScroll = () => {
      const shouldDock = window.scrollY >= DOCK_SCROLL_THRESHOLD;
      const shouldUndock = window.scrollY <= UNDOCK_SCROLL_THRESHOLD;

      setIsDocked((current) => {
        if (!current && shouldDock) return true;
        if (current && shouldUndock) return false;
        return current;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;

    const target = isDocked ? end : start;

    const controls = [
      animate(left, target.left, spring),
      animate(top, target.top, spring),
      animate(size, target.size, spring),
      animate(borderRadius, isDocked ? 999 : 28, spring),
      animate(imageScale, isDocked ? 0.98 : 1, spring),
      animate(opacity, isDocked ? 0.96 : 1, {
        duration: 0.18,
        ease: "easeOut",
      }),
    ];

    return () => {
      controls.forEach((control) => control.stop());
    };
  }, [borderRadius, end, imageScale, isDocked, isReady, left, opacity, size, start, top]);

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      aria-label="Mikel Echeverria"
      className="pointer-events-none fixed z-[60]"
      style={{
        left,
        top,
        width: size,
        height: size,
        opacity: isReady ? opacity : 0,
      }}
    >
      <motion.div
        className="relative size-full overflow-hidden bg-zinc-200 shadow-2xl shadow-zinc-900/20 dark:bg-zinc-800 dark:shadow-black/40"
        style={{ borderRadius, scale: imageScale }}
      >
        <img
          className="size-full object-cover object-center"
          src="/photo.webp"
          alt="Mikel Echeverria, Desarrollador Full Stack y Backend"
          width={320}
          height={320}
          loading="eager"
        />
      </motion.div>
      {showHolidayHat && (
        <motion.img
          aria-hidden="true"
          className="absolute -right-[18%] -top-[26%] w-[72%] rotate-[-15deg] drop-shadow-md"
          src="/TheresaKnott_Santa_Hat.svg"
          alt=""
          style={{ scale: imageScale }}
        />
      )}
    </motion.div>
  );
}
