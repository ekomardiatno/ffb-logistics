import React, { useEffect, useMemo, useState } from "react";
import Card from "../common/Card";
import Loader from "../common/Loader";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchVehicles } from "../../store/vehiclesSlice";
import { fetchDrivers } from "../../store/driversSlice";
import { fetchMills } from "../../store/millsSlice";
import { createTrip } from "../../store/tripsSlice";
import type { Mill } from "../../types";
import { useNavigate } from "react-router-dom";

type Planned = { millId: string; plannedCollection: number };

export default function TripPlanner() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: vehicles, loading: vLoading } = useAppSelector(s => s.vehicles);
  const { items: drivers, loading: dLoading } = useAppSelector(s => s.drivers);
  const { items: mills, loading: mLoading } = useAppSelector(s => s.mills);

  const [vehicleId, setVehicleId] = useState<string>("");
  const [driverId, setDriverId] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 16)); // local datetime-local
  const [planned, setPlanned] = useState<Planned[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchDrivers());
    dispatch(fetchMills());
  }, [dispatch]);

  const vehicle = useMemo(() => vehicles.find(v => v.id === vehicleId), [vehicles, vehicleId]);
  const capacity = vehicle?.capacity ?? 12;
  const totalPlanned = planned.reduce((s, p) => s + (Number(p.plannedCollection) || 0), 0);
  const remaining = Math.max(0, capacity - totalPlanned);

  function addMill(m: Mill) {
    if (planned.find(p => p.millId === m.id)) return;
    setPlanned(prev => [...prev, { millId: m.id, plannedCollection: Math.min(6, capacity - totalPlanned) }]);
  }

  function updatePlanned(millId: string, value: number) {
    setPlanned(prev => prev.map(p => (p.millId === millId ? { ...p, plannedCollection: value } : p)));
  }

  function removePlanned(millId: string) {
    setPlanned(prev => prev.filter(p => p.millId !== millId));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!vehicleId || !driverId) {
      setError("Please select a vehicle and a driver.");
      return;
    }
    if (totalPlanned > capacity) {
      setError("Total planned collection exceeds vehicle capacity.");
      return;
    }
    if (planned.length === 0) {
      setError("Please add at least one mill.");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        createTrip({
          vehicleId,
          driverId,
          scheduledDate: new Date(date).toISOString(),
          estimatedDuration: 90,
          mills: planned
        }) as any
      ).unwrap();
      setSuccess("Trip created successfully.");
      setPlanned([]);
      navigate(-1)
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Failed to create trip.");
    } finally {
      setSubmitting(false);
    }
  }

  if (vLoading || dLoading || mLoading) return <Loader label="Loading planner..." />;

  return (
    <Card title="Trip Planner">
      <form onSubmit={submit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: selectors */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Vehicle</label>
            <select
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">Select vehicle</option>
              {(driverId ? vehicles.filter(v => v.driverId === driverId) : vehicles).filter(v => v.status === "idle").map(v => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} • {v.capacity}ton(s) • {v.status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Driver</label>
            <select
              value={driverId}
              onChange={e => setDriverId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            >
              <option value="">Select driver</option>
              {(vehicleId && vehicles.find(v => v.id === vehicleId) ? drivers.filter(d => d.id === vehicles.find(v => v.id === vehicleId)?.driverId) : drivers).filter(d => d.status === "available").map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} • {d.status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Scheduled Time</label>
            <input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-sm text-gray-500">Capacity</div>
            <div className="mt-1 text-xl font-semibold">{capacity} t</div>
            <div className="mt-2 text-sm text-gray-500">Planned Total</div>
            <div className={`mt-1 text-xl font-semibold ${totalPlanned > capacity ? "text-red-600" : ""}`}>
              {totalPlanned} ton(s)
            </div>
            <div className="mt-2 text-sm text-gray-500">Remaining</div>
            <div className={`mt-1 text-xl font-semibold ${remaining === 0 ? "text-yellow-600" : ""}`}>
              {remaining} ton(s)
            </div>
          </div>
        </div>

        {/* Middle: planned list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Planned Collections</div>
            <div className="text-xs text-gray-500">{planned.length} mills</div>
          </div>

          {planned.length === 0 && (
            <div className="rounded-xl border border-dashed p-6 text-center text-gray-500">
              No mills selected. Choose from the list on the right.
            </div>
          )}

          <div className="space-y-3">
            {planned.map(p => {
              const m = mills.find(mm => mm.id === p.millId);
              return (
                <div key={p.millId} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{m?.name}</div>
                    <div className="text-xs text-gray-500">
                      Avg/day: {m?.avgDailyProduction?.toLocaleString()} ton(s)
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={p.plannedCollection}
                      onChange={e => updatePlanned(p.millId, Number(e.target.value))}
                      className="w-24 rounded-lg border px-2 py-1 text-right"
                    />
                    <span className="text-sm text-gray-600">t</span>
                    <button
                      type="button"
                      onClick={() => removePlanned(p.millId)}
                      className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: mills list */}
        <div className="lg:col-span-1">
          <div className="mb-2 font-semibold">Mills</div>
          <div className="max-h-[480px] space-y-2 overflow-auto pr-1">
            {mills.map(m => (
              <button
                type="button"
                key={m.id}
                onClick={() => addMill(m)}
                className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-gray-500">Contact: {m.contactPerson}</div>
                </div>
                <div className="text-xs text-gray-500">{m.avgDailyProduction} ton(s)/day</div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions & alerts */}
        <div className="lg:col-span-3">
          {error && <div className="mb-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div className="mb-3 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700">{success}</div>}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setVehicleId("");
                setDriverId("");
                setPlanned([]);
                setError(null);
                setSuccess(null);
              }}
              className="rounded-xl border px-4 py-2 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              disabled={submitting}
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </div>
      </form>
    </Card>
  );
}
