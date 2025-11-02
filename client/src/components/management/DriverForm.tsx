import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchDrivers, updateDriver, createDriver } from "../../store/driversSlice";
import { Driver } from "../../types";

export default function DriverForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const driver = useAppSelector(s => s.drivers.items.find(d => d.id === id));
  const [form, setForm] = useState<Omit<Driver, 'id'>>({
    name: "",
    licenseNumber: "",
    phoneNumber: "",
    status: "available"
  });

  useEffect(() => {
    if (!driver && isEdit) dispatch(fetchDrivers());
    if (driver) setForm(driver);
  }, [driver, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      if(!id) return;
      await dispatch(updateDriver({ id, changes: form }));
    } else {
      await dispatch(createDriver(form));
    }
    navigate(-1);
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow p-6 rounded-xl">
      <h1 className="text-xl font-bold mb-4">{isEdit ? "Edit Driver" : "Add New Driver"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full border p-2 rounded" required />
        <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="License Number" className="w-full border p-2 rounded" />
        <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone Number" className="w-full border p-2 rounded" />
        <select name="status" value={form.status} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="available">Available</option>
          <option value="on_trip">On Trip</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="px-3 py-2 border rounded-md cursor-pointer">Cancel</button>
          <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-md cursor-pointer">{isEdit ? "Save" : "Create"}</button>
        </div>
      </form>
    </div>
  );
}
