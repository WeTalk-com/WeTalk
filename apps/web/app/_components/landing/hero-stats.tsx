"use client";

import { useCountUp, useReducedMotion } from "./hooks";

function Stat({
  target,
  suffix,
  label,
  enabled,
}: {
  target: number;
  suffix: string;
  label: string;
  enabled: boolean;
}) {
  const value = useCountUp(target, 1600, enabled);
  return (
    <div>
      <div className="font-head text-3xl font-extrabold text-brown">
        {Math.round(value).toLocaleString("en-US")}
        {suffix}
      </div>
      <div className="text-sm text-brown-sec">{label}</div>
    </div>
  );
}

export function HeroStats() {
  const reduced = useReducedMotion();

  return (
    <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
      <Stat target={120} suffix="k+" label="creators" enabled={!reduced} />
      <Stat target={4} suffix="M" label="golden hours" enabled={!reduced} />
      <Stat target={98} suffix="%" label="come back daily" enabled={!reduced} />
    </div>
  );
}
