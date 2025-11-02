import { useEffect, useMemo, useRef, useState } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchTrips } from "../../store/tripsSlice";
import { fetchVehicles } from "../../store/vehiclesSlice";
import { fetchDrivers } from "../../store/driversSlice";
import { Driver, Trip, Vehicle } from "../../types";
import TripRowActions from "./TripRowActions";
import classNames from "classnames";
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  scheduled: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function TripList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: trips, loading } = useAppSelector((s) => s.trips);
  const vehicles = useAppSelector((s) => s.vehicles.items);
  const drivers = useAppSelector((s) => s.drivers.items);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);

  const [searchInput, setSearchInput] = useState<string>("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<
    "all" | "scheduled" | "in_progress" | "completed" | "cancelled"
  >("all");

  useEffect(() => {
    dispatch(fetchTrips());
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    return trips.filter((t) => {
      const v = vehicles.find((v) => v.id === t.vehicleId);
      const d = drivers.find((d) => d.id === t.driverId);
      const matchQ = q
        ? (v?.plateNumber || "").toLowerCase().includes(q.toLowerCase()) ||
          (d?.name || "").toLowerCase().includes(q.toLowerCase())
        : true;
      const matchStatus = status === "all" ? true : t.status === status;
      return matchQ && matchStatus;
    });
  }, [q, status, trips, vehicles, drivers]);

  const showingRows = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const timeoutSearch = useRef<NodeJS.Timeout | null>(null);

  if (loading) return <Loader label="Loading trips..." />;

  return (
    <Card
      title="Trips"
      right={
        <div className="flex gap-2 flex-wrap">
          <input
            value={searchInput}
            onChange={(e) => {
              if (timeoutSearch.current) {
                clearTimeout(timeoutSearch.current);
              }
              timeoutSearch.current = setTimeout(() => {
                setPage(1);
                setQ(e.target.value);
              }, 300);
              setSearchInput(e.target.value);
            }}
            placeholder="Search plate or driver..."
            className="rounded-lg border px-3 py-1.5 text-sm"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as any);
              setPage(1);
            }}
            className="rounded-lg border px-3 py-1.5 text-sm"
          >
            <option value="all">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => {
              navigate("/planner");
            }}
            className="cursor-pointer rounded-lg border px-2 py-1.5 text-sm bg-blue-700 text-white border-blue-700 hover:bg-blue-800 flex items-center gap-1"
          >
            <FaPlus />
            <span>Create Trip</span>
          </button>
        </div>
      }
    >
      <div className="overflow-hidden w-full">
        <div className="overflow-auto w-full max-h-[80vh] border border-gray-300">
          <table className="min-w-full bg-white">
            <thead className="sticky left-0 right-0 -top-px bg-gray-100 z-10 shadow-sm">
              <tr className="text-xs uppercase font-bold text-gray-500 items-center hidden md:table-row">
                <th className="border border-gray-300 p-2 py-3">Date</th>
                <th className="border border-gray-300 p-2 py-3">Vehicle</th>
                <th className="border border-gray-300 p-2 py-3">Driver</th>
                <th className="border border-gray-300 p-2 py-3">Status</th>
                <th className="border border-gray-300 p-2 py-3">
                  Est. Duration
                </th>
                <th className="border border-gray-300 p-2 py-3">Collections</th>
                <th className="w-1 border border-gray-300 p-2 py-3">Actions</th>
              </tr>
            </thead>
            {/* Virtualized Rows */}
            <tbody className="flex flex-col gap-4 md:table-row-group">
              {filtered.length > 0 ? (
                showingRows.map((trip, index) => (
                  <RowComponent
                    index={index}
                    vehicles={vehicles}
                    drivers={drivers}
                    filtered={showingRows}
                    key={trip.id}
                  />
                ))
              ) : (
                <tr className="block md:table-row">
                  <td
                    colSpan={7}
                    className="block md:table-cell py-6 text-center text-gray-500 border border-gray-300 p-2"
                  >
                    No trips found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center py-2">
          <div>
            <span className="text-sm text-gray-500">
              Showing {Math.min((page - 1) * limit + 1, filtered.length)} to{" "}
              {Math.min(page * limit, filtered.length)} of {filtered.length}{" "}
              trips
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="rounded-lg border px-2 py-1 text-xs"
            >
              Previous
            </button>
            <select
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              className="rounded-lg border px-2 py-1 text-xs"
            >
              {Array.from(
                {
                  length: Math.ceil(filtered.length / limit),
                },
                (_, i) => i + 1
              ).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page * limit >= filtered.length}
              className="rounded-lg border px-2 py-1 text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RowComponent({
  index,
  vehicles,
  drivers,
  filtered,
  className,
}: {
  index: number;
  vehicles: Vehicle[];
  drivers: Driver[];
  filtered: Trip[];
  className?: string;
}) {
  const t = filtered[index];
  const v = vehicles.find((v) => v.id === t.vehicleId);
  const d = drivers.find((d) => d.id === t.driverId);
  const total = (t.collections || []).reduce(
    (s, c) => s + (c.collected || 0),
    0
  );

  console.log(v, d, t, index);

  return (
    <tr
      className={classNames([
        "md:gap-0 items-start md:border-0 md:items-center block md:table-row p-4 md:p-0 rounded-md md:rounded-none border border-gray-300",
        className,
      ])}
    >
      <td className="grid grid-cols-2 gap-3 md:table-cell w-full md:w-auto border-0 md:border border-gray-300 p-2">
        <div className="md:hidden text-xs font-bold uppercase text-gray-500">
          Date
        </div>
        <div>{new Date(t.scheduledDate).toLocaleString()}</div>
      </td>
      <td className="grid grid-cols-2 gap-3 md:table-cell w-full md:w-auto border-0 md:border border-gray-300 p-2">
        <div className="md:hidden text-xs font-bold uppercase text-gray-500">
          Plate Number
        </div>
        <div>{v?.plateNumber || "—"}</div>
      </td>
      <td className="grid grid-cols-2 gap-3 md:table-cell w-full md:w-auto border-0 md:border border-gray-300 p-2">
        <div className="md:hidden text-xs font-bold uppercase text-gray-500">
          Plate Number
        </div>
        <div>{d?.name || "—"}</div>
      </td>
      <td className="grid grid-cols-2 gap-3 md:table-cell w-full md:w-auto border-0 md:border border-gray-300 p-2">
        <div className="md:hidden text-xs font-bold uppercase text-gray-500">
          Status
        </div>
        <div>
          <span
            className={`px-2 py-1 rounded-full text-xs uppercase ${
              statusColors[t.status] || ""
            }`}
          >
            {t.status}
          </span>
        </div>
      </td>
      <td className="grid grid-cols-2 gap-3 md:table-cell w-full md:w-auto border-0 md:border border-gray-300 p-2">
        <div className="md:hidden text-xs font-bold uppercase text-gray-500">
          Est. Duration
        </div>
        <div>{t.estimatedDuration} min</div>
      </td>

      <td className="grid grid-cols-2 gap-3 md:table-cell w-full md:w-auto border-0 md:border border-gray-300 p-2">
        <div className="md:hidden text-xs font-bold uppercase text-gray-500">
          Est. Duration
        </div>
        <div>{total} ton(s)</div>
      </td>
      <td className="text-right md:text-center border-0 md:border border-gray-300 p-2">
        <TripRowActions tripId={t.id} />
      </td>
    </tr>
  );
}
