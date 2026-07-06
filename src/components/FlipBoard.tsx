"use client";

import { useEffect, useRef, useState } from "react";

const RANDOM_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomChar() {
  return RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

let sharedAudioCtx: AudioContext | null = null;

/** A quiet, dry mechanical tick — a short filtered noise burst, not a tone.
 * Created lazily (and only after a user gesture) since browsers block
 * AudioContext until then; failures are silently ignored. */
function playFlapTick() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    sharedAudioCtx ??= new Ctx();
    const ctx = sharedAudioCtx;
    if (ctx.state === "suspended") {
      void ctx.resume();
      return;
    }

    const duration = 0.03;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2200;
    filter.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.value = 0.05;

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
  } catch {
    /* audio is a nicety, never let it break the animation */
  }
}

/** A single split-flap character tile: amber glyph on a recessed board-well
 * face, with a thin hairline seam across the middle like a real flap unit. */
function FlapTile({
  target,
  delayMs,
  flipDurationMs,
  reducedMotion,
  tileClassName,
}: {
  target: string;
  delayMs: number;
  flipDurationMs: number;
  reducedMotion: boolean;
  tileClassName: string;
}) {
  const [display, setDisplay] = useState(reducedMotion ? target : "");
  const [flipKey, setFlipKey] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (reducedMotion) {
      setDisplay(target);
      return;
    }

    const stepCount = 3 + Math.floor(Math.random() * 2);
    const sequence = Array.from({ length: stepCount }, () => randomChar());
    sequence.push(target);

    sequence.forEach((char, i) => {
      const timer = setTimeout(
        () => {
          setDisplay(char);
          setFlipKey((k) => k + 1);
          playFlapTick();
        },
        delayMs + i * flipDurationMs
      );
      timersRef.current.push(timer);
    });

    return () => timersRef.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, delayMs, flipDurationMs, reducedMotion]);

  if (target === " ") {
    return <span className="inline-block w-[0.55em]" aria-hidden />;
  }

  return (
    <span
      className={`flap-tile relative inline-flex items-center justify-center bg-board-well border border-hairline rounded-[4px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.7)] ${tileClassName}`}
    >
      <span
        key={flipKey}
        className="flap-tile-inner animate-flap-flip block text-flap-amber"
        style={{ animationDuration: `${flipDurationMs}ms` }}
      >
        {display}
      </span>
      <span className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-board-ink/80" />
    </span>
  );
}

/**
 * Split-flap "Solari board" text display. Renders `text` as a row of
 * character tiles that flip through a few random glyphs before settling on
 * the final character, staggered left-to-right so it reads like a real
 * arrivals board updating. Spaces render as blank gaps (no tile chrome).
 *
 * Reserved for the app's four signature moments (hero headline, flight
 * status word, countdown number) — not a general-purpose text animation.
 */
export function FlipBoard({
  text,
  className = "",
  tileClassName = "",
  flipDurationMs = 380,
  staggerMs = 40,
}: {
  text: string;
  className?: string;
  tileClassName?: string;
  flipDurationMs?: number;
  staggerMs?: number;
}) {
  const reducedMotion = useReducedMotion();
  // Split into words so a wrapping container only breaks lines between
  // words, never mid-word (each word is kept together via flex-nowrap).
  const words = text.split(" ");
  let charIndex = 0;

  return (
    <span className={`inline-flex flex-wrap ${className}`} role="text" aria-label={text}>
      {words.map((word, wordIdx) => {
        const start = charIndex;
        charIndex += word.length + 1;
        return (
          // A fragment-like pair: the word itself never breaks (flex-nowrap),
          // but the space after it is a separate flex item at the top level,
          // so the line can only wrap between words.
          <span key={wordIdx} className="inline-flex flex-nowrap">
            {word.split("").map((ch, i) => (
              <FlapTile
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                target={ch.toUpperCase()}
                delayMs={(start + i) * staggerMs}
                flipDurationMs={flipDurationMs}
                reducedMotion={reducedMotion}
                tileClassName={tileClassName}
              />
            ))}
            {wordIdx < words.length - 1 && (
              <FlapTile
                target=" "
                delayMs={0}
                flipDurationMs={flipDurationMs}
                reducedMotion={reducedMotion}
                tileClassName={tileClassName}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}
