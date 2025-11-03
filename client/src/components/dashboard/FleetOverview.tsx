import { useEffect } from "react";
import Stat from "../common/Stat";
import Card from "../common/Card";
import Loader from "../common/Loader";
import { fetchVehicles } from "../../store/vehiclesSlice";
import { fetchDrivers } from "../../store/driversSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";

export default function FleetOverview() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: vehicles, loading: vLoading } = useSelector((s: RootState) => s.vehicles);
  const { items: drivers, loading: dLoading } = useSelector((s: RootState) => s.drivers);

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
  }, [dispatch]);

  const activeVehicles = vehicles.filter(v => v.status === "on_trip").length;
  const assignedDrivers = vehicles.filter(v => v.driverId).length;
  const availableDrivers = drivers.filter(d => d.status === "available").length;

  if (vLoading || dLoading) return <Loader label={"Loading fleet overview..."} />;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Stat label="Total Vehicles" value={vehicles.length} />
      <Stat label="Active Vehicles" value={activeVehicles} />
      <Stat label="Assigned Drivers" value={assignedDrivers} />
      <Stat label="Available Drivers" value={availableDrivers} />
      <div className="md:col-span-4">
        <Card title="Driver Assignments">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.slice(0, 12).map(v => {
              const driver = drivers.find(d => d.id === v.driverId);
              return (
                <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{v.plateNumber}</div>
                    <div className="text-xs text-gray-500">{v.type.split('_').join(' ').toUpperCase()} • {v.capacity} ton(s)</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{driver ? driver.name : "— Unassigned —"}</div>
                    <div className="text-xs text-gray-500">{v.status.split('_').join(' ').toUpperCase()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
