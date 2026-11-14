import { useMemo, useState, type PointerEvent } from "react";

/** One reading, compacted: [time (ms), range (mi), fuel (%), fuel left (gal), odometer (mi)]. */
export type Reading = [number, number, number, number, number];

interface Props {
  readings: Reading[];
}

interface Series {
  id: string;
  label: string;
  unit: string;
  pick: (reading: Reading) => number;
  digits: number;
}

const SERIES: Series[] = [
  { id: "fuel", label: "fuel level", unit: "%", pick: (r) => r[2], digits: 0 },
  { id: "odometer", label: "odometer", unit: "mi", pick: (r) => r[4], digits: 0 },
  { id: "range", label: "est. range", unit: "mi", pick: (r) => r[1], digits: 0 },
];

const PAGE_SIZE = 20;
const WIDTH = 800;
const HEIGHT = 220;
const MAX_POINTS = 400;

const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const fullDate = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

const number = (value: number, digits = 0) =>
  value.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits });

/** Keeps every nth reading so the SVG path stays small; always keeps the last one. */
function downsample(readings: Reading[]): Reading[] {
  if (readings.length <= MAX_POINTS) return readings;

  const step = readings.length / MAX_POINTS;
  const result: Reading[] = [];

  for (let i = 0; i < MAX_POINTS; i++) result.push(readings[Math.floor(i * step)]);
  result.push(readings[readings.length - 1]);

  return result;
}

function Chart({ readings, series }: { readings: Reading[]; series: Series }) {
  const points = useMemo(() => downsample(readings), [readings]);
  const [hover, setHover] = useState<number | null>(null);

  const values = points.map(series.pick);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const first = points[0][0];
  const span = Math.max(1, points[points.length - 1][0] - first);

  const x = (reading: Reading) => ((reading[0] - first) / span) * WIDTH;
  const y = (value: number) => HEIGHT - ((value - min) / Math.max(1, max - min)) * (HEIGHT - 8) - 4;

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(p).toFixed(1)},${y(series.pick(p)).toFixed(1)}`)
    .join("");

  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const t = first + ((event.clientX - box.left) / box.width) * span;
    let nearest = 0;

    for (let i = 1; i < points.length; i++) {
      if (Math.abs(points[i][0] - t) < Math.abs(points[nearest][0] - t)) nearest = i;
    }

    setHover(nearest);
  };

  const shown = points[hover ?? points.length - 1];

  return (
    <figure className="border-rule rounded-lg border p-4">
      <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-2xl font-bold tabular-nums">
          {number(series.pick(shown), series.digits)}
          <span className="text-muted ml-1 text-sm font-normal">{series.unit}</span>
        </span>
        <span className="text-muted text-sm">{fullDate.format(shown[0])}</span>
      </figcaption>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-48 w-full touch-none"
        role="img"
        aria-label={`${series.label} from ${shortDate.format(first)} to ${shortDate.format(first + span)}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <path d={`${line}L${WIDTH},${HEIGHT}L0,${HEIGHT}Z`} className="fill-wash" />
        <path
          d={line}
          className="stroke-ink fill-none"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
        {hover !== null ? (
          <line
            x1={x(shown)}
            x2={x(shown)}
            y1={0}
            y2={HEIGHT}
            className="stroke-muted"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>
      <div className="text-muted mt-1 flex justify-between text-xs">
        <span>{shortDate.format(first)}</span>
        <span>{shortDate.format(first + span)}</span>
      </div>
    </figure>
  );
}

export default function CarStats({ readings }: Props) {
  const [seriesId, setSeriesId] = useState(SERIES[0].id);
  const [page, setPage] = useState(0);
  const [newestFirst, setNewestFirst] = useState(true);

  const stats = useMemo(() => {
    const oldest = readings[0];
    const latest = readings[readings.length - 1];
    const days = Math.max(1, (latest[0] - oldest[0]) / 86_400_000);

    return {
      odometer: latest[4],
      fuel: latest[2],
      range: latest[1],
      perDay: (latest[4] - oldest[4]) / days,
    };
  }, [readings]);

  const rows = useMemo(
    () => (newestFirst ? [...readings].reverse() : readings),
    [readings, newestFirst],
  );

  const pages = Math.ceil(rows.length / PAGE_SIZE);
  const visible = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const series = SERIES.find((s) => s.id === seriesId) ?? SERIES[0];

  const tiles = [
    { label: "odometer", value: `${number(stats.odometer)} mi` },
    { label: "fuel level", value: `${number(stats.fuel)}%` },
    { label: "est. range", value: `${number(stats.range)} mi` },
    { label: "avg miles/day", value: number(stats.perDay, 1) },
  ];

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="border-rule rounded-lg border p-4">
            <dt className="text-muted text-sm">{tile.label}</dt>
            <dd className="text-xl font-bold tabular-nums">{tile.value}</dd>
          </div>
        ))}
      </dl>

      <div role="tablist" aria-label="chart" className="flex flex-wrap gap-2 text-sm">
        {SERIES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === series.id}
            onClick={() => setSeriesId(s.id)}
            className={`border-ink cursor-pointer rounded-lg border px-3 py-1.5 ${s.id === series.id ? "bg-ink text-paper" : "hover:bg-wash"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <Chart readings={readings} series={series} />

      <div className="border-rule overflow-hidden rounded-lg border text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left tabular-nums">
            <thead className="bg-wash">
              <tr>
                <th className="p-3">
                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() => {
                      setNewestFirst((value) => !value);
                      setPage(0);
                    }}
                  >
                    date {newestFirst ? "↓" : "↑"}
                  </button>
                </th>
                <th className="p-3">fuel</th>
                <th className="p-3">left</th>
                <th className="p-3">range</th>
                <th className="p-3">odometer</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r[0]} className="border-rule border-t">
                  <td className="p-3 whitespace-nowrap">{fullDate.format(r[0])}</td>
                  <td className="p-3">{number(r[2])}%</td>
                  <td className="p-3">{number(r[3], 2)} gal</td>
                  <td className="p-3">{number(r[1])} mi</td>
                  <td className="p-3">{number(r[4])} mi</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-rule bg-wash flex items-center justify-between border-t p-3">
          <span className="text-muted">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, rows.length)} of {rows.length}
          </span>
          <span className="flex gap-2">
            <button
              type="button"
              className="link cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              previous
            </button>
            <button
              type="button"
              className="link cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              next
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
