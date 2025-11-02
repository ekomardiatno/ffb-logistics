import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  fetchVehicles,
  createVehicle,
  updateVehicle,
} from "../../store/vehiclesSlice";
import { fetchDrivers } from "../../store/driversSlice";
import { Vehicle } from "../../types";
import Loader from "../common/Loader";
import { AxiosError } from "axios";
import { FaCircleExclamation } from "react-icons/fa6";

export default function VehicleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const vehicle = useAppSelector((s) =>
    s.vehicles.items.find((v) => v.id === id)
  );
  const drivers = useAppSelector((s) => s.drivers.items);

  const [form, setForm] = useState<Omit<Vehicle, "id" | "status">>({
    plateNumber: "",
    type: "truck",
    capacity: 12,
    driverId: "",
  });
  const [capacityInput, setCapacityInput] = useState("");
  const [error, setError] = useState<Error | TypeError | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    { field: string; message: string }[]
  >([]);

  useEffect(() => {
    dispatch(fetchDrivers());
    if (isEdit && !vehicle) dispatch(fetchVehicles());
    if (vehicle) {
      setForm(vehicle);
      setCapacityInput(vehicle.capacity.toString());
    }
  }, [vehicle, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors([]);
    try {
      if (isEdit) {
        await dispatch(updateVehicle({ id: id!, data: form })).unwrap();
      } else {
        await dispatch(createVehicle(form)).unwrap();
      }
      navigate(-1);
    } catch (err) {
      if (err instanceof AxiosError) {
        if (
          err.response?.status === 400 &&
          err.response.data?.error === "Validation error"
        ) {
          setValidationErrors(err.response.data.details);
        } else {
          setError(
            new Error(
              err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "An error occurred"
            )
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const timeoutInput = React.useRef<NodeJS.Timeout | null>(null);

  return (
    <div className="max-w-lg mx-auto bg-white shadow p-6 rounded-xl">
      <h1 className="text-xl font-bold mb-4">
        {isEdit ? "Edit Vehicle" : "Add New Vehicle"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <input
            name="plateNumber"
            placeholder="Plate Number"
            className="w-full border p-2 rounded"
            value={form.plateNumber}
            onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
            disabled={loading}
          />
          {validationErrors.find((e) => e.field === "plateNumber") && (
            <div className="text-red-500 text-xs italic">
              {validationErrors.find((e) => e.field === "plateNumber")?.message}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            type="text"
            name="type"
            placeholder="Type (truck, pickup)"
            className="w-full border p-2 rounded"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            disabled={loading}
          />
          {validationErrors.find((e) => e.field === "type") && (
            <div className="text-red-500 text-xs italic">
              {validationErrors.find((e) => e.field === "type")?.message}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            type="number"
            name="capacity"
            placeholder="Capacity (tons)"
            className="w-full border p-2 rounded"
            value={capacityInput}
            onChange={(e) => {
              setCapacityInput(e.target.value);
              if (timeoutInput.current) clearTimeout(timeoutInput.current);
              timeoutInput.current = setTimeout(() => {
                if (isNaN(Number(e.target.value))) {
                  setCapacityInput(form.capacity?.toString() || "");
                  return;
                }
                setForm({ ...form, capacity: Number(e.target.value) });
                setCapacityInput(Number(e.target.value).toString());
              }, 800);
            }}
            disabled={loading}
          />
          {validationErrors.find((e) => e.field === "capacity") && (
            <div className="text-red-500 text-xs italic">
              {validationErrors.find((e) => e.field === "capacity")?.message}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <select
            name="driverId"
            className="w-full border p-2 rounded"
            value={form.driverId || ""}
            onChange={(e) => setForm({ ...form, driverId: e.target.value })}
            disabled={loading}
          >
            <option value="">No Driver Assigned</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {validationErrors.find((e) => e.field === "driverId") && (
            <div className="text-red-500 text-xs italic">
              {validationErrors.find((e) => e.field === "driverId")?.message}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          {error && (
            <div className="text-red-500 text-xs italic mr-auto flex items-center gap-1">
              <FaCircleExclamation />
              <span>{error.message}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-3 py-2 border rounded-md cursor-pointer"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-2 bg-blue-600 text-white rounded-md cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <Loader containerClassName="!py-0 !text-white" />
            ) : isEdit ? (
              "Save"
            ) : (
              "Create"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
