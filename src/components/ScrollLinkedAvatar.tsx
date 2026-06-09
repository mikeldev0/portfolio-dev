import {
  LazyMotion,
  animate,
  domAnimation,
  m,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useHolidayEffectsActive } from "../lib/holiday";

const HERO_ANCHOR_SELECTOR = "#hero-avatar-anchor";
const HEADER_ANCHOR_SELECTOR = "#header-avatar-anchor";
const HEADER_COMPACT_HEIGHT = 64;
const DOCK_SCROLL_THRESHOLD = 36;

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
  const hasPlacedAvatar = useRef(false);
  const isDockedRef = useRef(false);

  const left = useMotionValue(0);
  const top = useMotionValue(0);
  const size = useMotionValue(0);
  const borderRadius = useMotionValue(28);
  const imageScale = useMotionValue(1);
  const opacity = useMotionValue(0);

  useEffect(() => {
    const heroAnchor = document.querySelector(HERO_ANCHOR_SELECTOR);
    const headerAnchor = document.querySelector(HEADER_ANCHOR_SELECTOR);

    if (!heroAnchor || !headerAnchor) return;

    const measure = () => {
      const hBox = getAnchorBox(heroAnchor);
      const headBox = getCompactHeaderBox(headerAnchor);

      setHeroBox(hBox);
      setHeaderBox(headBox);

      if (!hasPlacedAvatar.current) {
        const isDocked = window.scrollY >= DOCK_SCROLL_THRESHOLD;
        const target = isDocked ? headBox : hBox;

        isDockedRef.current = isDocked;
        left.set(target.left);
        top.set(target.top);
        size.set(target.size);
        borderRadius.set(isDocked ? 999 : 28);
        imageScale.set(isDocked ? 0.98 : 1);
        opacity.set(isDocked ? 0.96 : 1);
        hasPlacedAvatar.current = true;
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(heroAnchor);
    observer.observe(headerAnchor);
    observer.observe(document.body);

    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const isReady = Boolean(heroBox && headerBox && !prefersReducedMotion && hasPlacedAvatar.current);

  useEffect(() => {
    document.documentElement.classList.toggle("scroll-avatar-ready", isReady);

    return () => {
      document.documentElement.classList.remove("scroll-avatar-ready");
    };
  }, [isReady]);

  useEffect(() => {
    if (!isReady || !heroBox || !headerBox) return;

    let controls: ReturnType<typeof animate>[] = [];

    const animateTo = (target: AvatarBox, docked: boolean) => {
      controls.forEach((control) => control.stop());
      controls = [
        animate(left, target.left, spring),
        animate(top, docked ? target.top : target.top - window.scrollY, spring),
        animate(size, target.size, spring),
        animate(borderRadius, docked ? 999 : 28, spring),
        animate(imageScale, docked ? 0.98 : 1, spring),
        animate(opacity, docked ? 0.96 : 1, {
          duration: 0.18,
          ease: "easeOut",
        }),
      ];
    };

    const handleScroll = () => {
      const current = isDockedRef.current;
      const nextDocked = window.scrollY >= DOCK_SCROLL_THRESHOLD;

      if (nextDocked === current) {
        // Update position if layout changed or scrolling while undocked
        const target = nextDocked ? headerBox : heroBox;
        left.set(target.left);
        top.set(nextDocked ? target.top : target.top - window.scrollY);
        size.set(target.size);
        return;
      }

      isDockedRef.current = nextDocked;
      animateTo(nextDocked ? headerBox : heroBox, nextDocked);
    };

    // Immediate check to synchronize state
    if (window.scrollY >= DOCK_SCROLL_THRESHOLD) {
      isDockedRef.current = true;
      animateTo(headerBox, true);
    } else {
      isDockedRef.current = false;
      top.set(heroBox.top - window.scrollY);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      controls.forEach((control) => control.stop());
    };
  }, [headerBox, heroBox, isReady, left, top, size, borderRadius, imageScale, opacity]);

  if (prefersReducedMotion) return null;

  return (
    <LazyMotion features={domAnimation}>
      <m.div
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
        <m.div
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
        </m.div>
        {showHolidayHat && (
          <m.img
            aria-hidden="true"
            className="absolute -right-[18%] -top-[26%] w-[72%] rotate-[-15deg] drop-shadow-md"
            src="/TheresaKnott_Santa_Hat.svg"
            alt=""
            style={{ scale: imageScale }}
          />
        )}
      </m.div>
    </LazyMotion>
  );
}
