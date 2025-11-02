import { useEffect } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  assignVehicleDriver,
  fetchVehicles,
  updateVehicleStatus,
} from "../../store/vehiclesSlice";
import { fetchDrivers } from "../../store/driversSlice";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";

export default function VehicleManager() {
  const dispatch = useAppDispatch();
  const { items: vehicles, loading } = useAppSelector((s) => s.vehicles);
  const drivers = useAppSelector((s) => s.drivers.items);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
  }, [dispatch]);

  if (loading) return <Loader label="Loading vehicles..." />;

  return (
    <Card
      title="Vehicle Management"
      right={
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/vehicles/new")}
        >
          <FaPlus />
          <span>Add New Vehicle</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {vehicles.map((v) => (
          <div key={v.id} className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{v.plateNumber}</div>
                <div className="text-xs text-gray-500">
                  {v.type.split("_").join(" ").toUpperCase()} • {v.capacity} ton(s)
                </div>
              </div>
              <select
                className="rounded-lg border px-2 py-1 text-sm"
                value={v.status}
                onChange={(e) =>
                  dispatch(
                    updateVehicleStatus({
                      id: v.id,
                      status: e.target.value as any,
                    })
                  )
                }
              >
                {["idle", "on_trip", "maintenance"].map((s) => (
                  <option key={s} value={s}>
                    {s.split("_").join(" ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">Driver</div>
              <select
                className="rounded-lg border px-2 py-1 text-sm"
                value={v.driverId || ""}
                onChange={(e) =>
                  dispatch(
                    assignVehicleDriver({
                      id: v.id,
                      driverId: e.target.value || null,
                    })
                  )
                }
              >
                <option value="">— Unassigned —</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.status.split("_").join(" ").toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end mt-3">
              <button
                type="button"
                className="cursor-pointer border-b-2 border-gray-500 flex items-center gap-1"
                onClick={() => navigate(`/vehicles/${v.id}/edit`)}
              >
                <MdEdit className="text-gray-500 hover:text-gray-700" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
