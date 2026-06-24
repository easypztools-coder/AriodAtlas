"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend,
} from "recharts";
import type { PriceHistoryPoint } from "@/lib/prices/types";

interface PriceHistoryChartProps {
  data: PriceHistoryPoint[];
  onHover?: (date: string | null) => void;
}

const MEDIAN_COLOR = "#C3D9A1";
const BAND_COLOR = "#A3C17A";
const TEXT_MUTED = "#8B9A92";
const BG_CARD = "#1A1F1D";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const byKey: Record<string, number> = {};
  for (const entry of payload) {
    byKey[entry.dataKey] = typeof entry.value === "number" ? entry.value : 0;
  }

  const median = byKey["median"];
  const p25 = byKey["p25"];
  const p75 = byKey["p75"];
  const sampleSize: number = payload[0]?.payload?.sampleSize ?? 0;

  const date = new Date(label);
  const weekLabel = date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        backgroundColor: BG_CARD,
        border: "1px solid #2A2F2D",
        borderRadius: "10px",
        padding: "10px 14px",
        fontSize: "12px",
        color: "#FFFFFF",
        minWidth: "180px",
      }}
    >
      <p style={{ color: TEXT_MUTED, fontSize: "10px", marginBottom: "8px" }}>
        {weekLabel}
      </p>
      {median !== undefined && (
        <div style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between", gap: "16px" }}>
          <span style={{ color: TEXT_MUTED }}>Most common price</span>
          <span style={{ color: MEDIAN_COLOR, fontWeight: 700 }}>£{median.toFixed(2)}</span>
        </div>
      )}
      {p25 !== undefined && p75 !== undefined && (
        <div style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between", gap: "16px" }}>
          <span style={{ color: TEXT_MUTED }}>Typical range</span>
          <span style={{ color: BAND_COLOR }}>£{p25.toFixed(0)} – £{p75.toFixed(0)}</span>
        </div>
      )}
      {sampleSize > 0 && (
        <p style={{ color: TEXT_MUTED, fontSize: "10px", marginTop: "8px", borderTop: "1px solid #2A2F2D", paddingTop: "6px" }}>
          Based on {sampleSize} sale{sampleSize !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

export default function PriceHistoryChart({ data, onHover }: PriceHistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl bg-card p-6 text-center">
        <p className="text-sm text-muted">Not enough sales data to build a price graph yet.</p>
        <p className="mt-1 text-xs text-muted/50">Check back as more listings are tracked over time.</p>
      </div>
    );
  }

  const totalSamples = data.reduce((sum, d) => sum + d.sampleSize, 0);

  return (
    <div className="space-y-4">
      {/* ─── Chart ──────────────────────────────────────────────────────── */}
      <div className="h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onMouseMove={(state: any) => {
              if (state?.isTooltipActive && state?.activePayload?.length > 0) {
                onHover?.(state.activePayload[0].payload.date as string);
              }
            }}
            onMouseLeave={() => onHover?.(null)}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2A2F2D"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => {
                const date = new Date(d);
                return date.toLocaleDateString("en-GB", {
                  month: "short",
                  year: "2-digit",
                });
              }}
              stroke={TEXT_MUTED}
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              stroke={TEXT_MUTED}
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `£${v.toFixed(0)}`}
              domain={[0, "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Custom legend */}
            <Legend
              content={() => (
                <div className="flex items-center justify-center gap-4 pt-2 pb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="h-0.5 w-4 bg-[#C3D9A1]" />
                    <span className="text-[10px] text-[#8B9A92]">Most common price</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-4 rounded-sm bg-[#A3C17A]/20 border border-dashed border-[#A3C17A]" />
                    <span className="text-[10px] text-[#8B9A92]">Typical price range</span>
                  </div>
                </div>
              )}
            />

            <defs>
              <linearGradient id="p25p75Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BAND_COLOR} stopOpacity={0.2} />
                <stop offset="100%" stopColor={BAND_COLOR} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <Area
              type="monotone"
              dataKey="p75"
              stroke="none"
              fill="url(#p25p75Grad)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="p25"
              stroke="none"
              fill={BG_CARD}
              fillOpacity={1}
            />
            <Line
              type="monotone"
              dataKey="p75"
              stroke={BAND_COLOR}
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              activeDot={false}
              legendType="none"
            />
            <Line
              type="monotone"
              dataKey="p25"
              stroke={BAND_COLOR}
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              activeDot={false}
              legendType="none"
            />
            <Line
              type="monotone"
              dataKey="median"
              stroke={MEDIAN_COLOR}
              strokeWidth={2}
              dot={{ fill: MEDIAN_COLOR, strokeWidth: 0, r: 4 }}
              activeDot={{ fill: MEDIAN_COLOR, strokeWidth: 0, r: 6 }}
              name="median"
              legendType="line"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ─── Stats Footer ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-card/80 pt-3 text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-muted">eBay UK sold prices</span>
          <span className="text-muted/60">
            Verified completed listings only. Excludes unrelated species, multipacks and outliers.
          </span>
        </div>
        <span className="text-muted">{totalSamples} sales</span>
      </div>
    </div>
  );
}
