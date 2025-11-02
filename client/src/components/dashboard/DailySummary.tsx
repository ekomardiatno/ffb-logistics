import { useEffect } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import Stat from "../common/Stat";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchTrips } from "../../store/tripsSlice";
import { fetchMills } from "../../store/millsSlice";

export default function DailySummary() {
  const dispatch = useAppDispatch();
  const { items: trips, loading: tLoading } = useAppSelector(s => s.trips);
  const { items: mills, loading: mLoading } = useAppSelector(s => s.mills);

  useEffect(() => {
    dispatch(fetchTrips());
    dispatch(fetchMills());
  }, [dispatch]);

  const today = new Date().toDateString();
  const todaysTrips = trips.filter(t => new Date(t.scheduledDate).toDateString() === today);

  const scheduled = todaysTrips.filter(t => t.status === "scheduled").length;
  const completed = todaysTrips.filter(t => t.status === "completed").length;
  const inProgress = todaysTrips.filter(t => t.status === "in_progress").length;

  if (tLoading || mLoading) return <Loader label="Loading daily summary..." />;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Stat label="Scheduled Trips (Today)" value={scheduled} />
      <Stat label="In Progress (Today)" value={inProgress} />
      <Stat label="Completed Trips (Today)" value={completed} />
      <div className="md:col-span-3">
        <Card title="Pending Collections (Top 8 Mills by Production)">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
            {mills
              .slice()
              .sort((a, b) => b.avgDailyProduction - a.avgDailyProduction)
              .slice(0, 8)
              .map(m => (
                <div key={m.id} className="rounded-lg border p-3">
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-gray-500">Avg/day: {m.avgDailyProduction.toLocaleString()} ton(s)</div>
                  <div className="mt-1 text-xs text-gray-500">Contact: {m.contactPerson}</div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
