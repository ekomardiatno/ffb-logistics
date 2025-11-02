import { useMemo } from "react";
import Card from "../common/Card";
import { useAppSelector } from "../../hooks";
import classNames from "classnames";

export default function AnalyticsLite() {
  const trips = useAppSelector(s => s.trips.items);

  // Simple counts per status for the last 7 days
  const data = useMemo(() => {
    const map: Record<string, { scheduled: number; completed: number; in_progress: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      map[d.toDateString()] = { scheduled: 0, completed: 0, in_progress: 0 };
    }
    for (const t of trips) {
      const key = new Date(t.scheduledDate).toDateString();
      if (!map[key]) continue;
      if (t.status === "scheduled") map[key].scheduled++;
      if (t.status === "completed") map[key].completed++;
      if (t.status === "in_progress") map[key].in_progress++;
    }
    return Object.entries(map)
      .map(([date, counts]) => ({ date, ...counts }))
      .reverse();
  }, [trips]);

  return (
    <Card title="7-Day Trip Analytics">
      <div className="grid gap-2">
        {data.map((row, index) => (
          <div key={row.date} className={classNames("grid grid-cols-1 md:grid-cols-4 items-center gap-3 text-sm", {
            "mt-3 md:mt-0": index > 0
          })}>
            <div className="text-gray-600">{row.date}</div>
            <Bar label="Scheduled" value={row.scheduled} />
            <Bar label="In Progress" value={row.in_progress} />
            <Bar label="Completed" value={row.completed} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const width = Math.min(100, value * 10); // simple scale
  const color =
    label === "Completed" ? "bg-green-500" : label === "In Progress" ? "bg-blue-500" : "bg-yellow-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 text-xs text-gray-500">{label}</div>
      <div className="h-2 w-full rounded bg-gray-300">
        <div className={`h-2 rounded ${color}`} style={{ width: `${width}%` }} />
      </div>
      <div className="w-8 text-right text-xs">{value}</div>
    </div>
  );
}
