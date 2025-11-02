import FleetOverview from "./dashboard/FleetOverview";
import DailySummary from "./dashboard/DailySummary";
import AnalyticsLite from "./dashboard/AnalyticsLite";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fleet Dashboard</h1>
      <FleetOverview />
      <DailySummary />
      <AnalyticsLite />
    </div>
  );
}
