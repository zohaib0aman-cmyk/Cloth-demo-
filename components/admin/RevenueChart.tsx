"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { formatINR } from "@/lib/format";

type Point = { label: string; date: string; revenue: number; orders: number };

/** Single-series daily revenue bars: brand colour, rounded tops anchored to the baseline, hover tooltip, recessive grid. */
export function RevenueChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 240;
  const pad = { l: 52, r: 8, t: 12, b: 28 };
  const max = Math.max(1000, ...data.map((d) => d.revenue));
  const raw = max / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = ([1, 2, 2.5, 5, 10].find((m) => m * mag >= raw) ?? 10) * mag;
  const top = step * 4;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * top);
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const band = innerW / data.length;
  const barW = Math.min(28, band - 6);
  const y = (v: number) => pad.t + innerH - (v / top) * innerH;
  const short = (v: number) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Daily revenue for the last 14 days">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e7dfd3" strokeWidth={1} strokeDasharray={t === 0 ? undefined : "2 4"} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="fill-ink-mute text-[10px]">
              {short(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * band + (band - barW) / 2;
          const h = Math.max(0, innerH - (y(d.revenue) - pad.t));
          const r = Math.min(4, barW / 2, h);
          const by = pad.t + innerH - h;
          const path = h > 0 ? `M${x},${pad.t + innerH} L${x},${by + r} Q${x},${by} ${x + r},${by} L${x + barW - r},${by} Q${x + barW},${by} ${x + barW},${by + r} L${x + barW},${pad.t + innerH} Z` : "";
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onTouchStart={() => setHover(i)}>
              <rect x={pad.l + i * band} y={pad.t} width={band} height={innerH} fill="transparent" />
              {hover === i && <rect x={pad.l + i * band + 1} y={pad.t} width={band - 2} height={innerH} fill="rgb(var(--brand) / 0.05)" rx={4} />}
              {path && (
                <motion.path
                  d={path}
                  fill="rgb(var(--brand))"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  style={{ transformOrigin: `0px ${pad.t + innerH}px` }}
                  transition={{ duration: 0.6, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              {(i % 2 === 0 || data.length <= 8) && (
                <text x={pad.l + i * band + band / 2} y={H - 8} textAnchor="middle" className="fill-ink-mute text-[10px]">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-soft"
          style={{ left: `${((pad.l + hover * band + band / 2) / W) * 100}%` }}
        >
          <p className="font-semibold text-ink">{data[hover].date}</p>
          <p className="text-ink-soft">
            Revenue <b className="text-ink">{formatINR(data[hover].revenue)}</b>
          </p>
          <p className="text-ink-soft">
            Orders <b className="text-ink">{data[hover].orders}</b>
          </p>
        </div>
      )}
    </div>
  );
}
