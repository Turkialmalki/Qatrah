import { type HTMLAttributes } from "react";
import clsx from "clsx";

type Tone = "gold" | "green" | "navy" | "gray" | "red";

const tones: Record<Tone, string> = {
  gold: "bg-gold-100 text-gold-600",
  green: "bg-green-800/10 text-green-800",
  navy: "bg-navy-900/8 text-navy-900",
  gray: "bg-gray-100 text-gray-600",
  red: "bg-red-100 text-red-600",
};

export function Badge({
  tone = "navy",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
