import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchVehicles, createVehicle, updateVehicle } from "../../store/vehiclesSlice";
import { fetchDrivers } from "../../store/driversSlice";
import { Vehicle } from "../../types";

export default function VehicleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const vehicle = useAppSelector(s => s.vehicles.items.find(v => v.id === id));
  const drivers = useAppSelector(s => s.drivers.items);

  const [form, setForm] = useState<Omit<Vehicle, 'id' | 'status'>>({
    plateNumber: "",
    type: "truck",
    capacity: 12,
    driverId: ""
  });

  useEffect(() => {
    dispatch(fetchDrivers());
    if (isEdit && !vehicle) dispatch(fetchVehicles());
    if (vehicle) setForm(vehicle);
  }, [vehicle, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await dispatch(updateVehicle({ id: id!, data: form }));
    } else {
      await dispatch(createVehicle(form));
    }
    navigate(-1);
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow p-6 rounded-xl">
      <h1 className="text-xl font-bold mb-4">
        {isEdit ? "Edit Vehicle" : "Add New Vehicle"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="plateNumber"
          placeholder="Plate Number"
          className="w-full border p-2 rounded"
          value={form.plateNumber}
          onChange={e => setForm({ ...form, plateNumber: e.target.value })}
        />
        <input
          type="text"
          name="type"
          placeholder="Type (truck, pickup)"
          className="w-full border p-2 rounded"
          value={form.type}
          onChange={e => setForm({ ...form, type: e.target.value })}
        />
        <input
          type="number"
          name="capacity"
          placeholder="Capacity (tons)"
          className="w-full border p-2 rounded"
          value={form.capacity}
          onChange={e => setForm({ ...form, capacity: Number(e.target.value) })}
        />
        <select
          name="driverId"
          className="w-full border p-2 rounded"
          value={form.driverId || ""}
          onChange={e => setForm({ ...form, driverId: e.target.value })}
        >
          <option value="">No Driver Assigned</option>
          {drivers.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="px-3 py-2 border rounded-md cursor-pointer">
            Cancel
          </button>
          <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-md cursor-pointer">
            {isEdit ? "Save" : "Create Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
