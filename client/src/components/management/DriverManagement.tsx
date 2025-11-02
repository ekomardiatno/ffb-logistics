import { useEffect } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchDrivers, updateDriverStatus } from "../../store/driversSlice";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";

export default function DriverManager() {
  const dispatch = useAppDispatch();
  const { items: drivers, loading } = useAppSelector((s) => s.drivers);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchDrivers());
  }, [dispatch]);

  if (loading) return <Loader label="Loading drivers..." />;

  return (
    <Card
      title="Driver Management"
      right={
        <button
          type="button"
          className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/drivers/new")}
        >
          <FaPlus />
          <span>Add New Driver</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {drivers.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <div className="flex flex-row items-center gap-2">
                <span className="font-medium">{d.name}</span>
              </div>
              <div className="text-xs text-gray-500">
                {d.licenseNumber} • {d.phoneNumber}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <select
                className="rounded-lg border px-2 py-1 text-sm"
                value={d.status}
                onChange={(e) =>
                  dispatch(
                    updateDriverStatus({
                      id: d.id,
                      status: e.target.value as any,
                    })
                  )
                }
              >
                {["available", "on_trip", "inactive"].map((s) => (
                  <option key={s} value={s}>
                    {s.split("_").join(" ").toUpperCase()}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="cursor-pointer border-b-2 border-gray-500 flex items-center gap-1"
                onClick={() => navigate(`/drivers/${d.id}/edit`)}
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
