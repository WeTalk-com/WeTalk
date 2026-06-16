"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("landing.stats");

  return (
    <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
      <Stat target={120} suffix="k+" label={t("creators")} enabled={!reduced} />
      <Stat
        target={4}
        suffix="M"
        label={t("goldenHours")}
        enabled={!reduced}
      />
      <Stat
        target={98}
        suffix="%"
        label={t("comeBackDaily")}
        enabled={!reduced}
      />
    </div>
  );
}
