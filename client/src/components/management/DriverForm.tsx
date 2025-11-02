import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import {
  fetchDrivers,
  updateDriver,
  createDriver,
} from "../../store/driversSlice";
import { Driver } from "../../types";
import { AxiosError } from "axios";
import { FaCircleExclamation } from "react-icons/fa6";
import Loader from "../common/Loader";

export default function DriverForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const driver = useAppSelector((s) =>
    s.drivers.items.find((d) => d.id === id)
  );
  const [form, setForm] = useState<Omit<Driver, "id">>({
    name: "",
    licenseNumber: "",
    phoneNumber: "",
    status: "available",
  });
  const [error, setError] = useState<Error | TypeError | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    { field: string; message: string }[]
  >([]);

  useEffect(() => {
    if (!driver && isEdit) dispatch(fetchDrivers());
    if (driver) setForm(driver);
  }, [driver, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationErrors([]);
    try {
      if (isEdit) {
        if (!id) return;
        await dispatch(updateDriver({ id, changes: form })).unwrap();
      } else {
        await dispatch(createDriver(form)).unwrap();
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

  return (
    <div className="max-w-lg mx-auto bg-white shadow p-6 rounded-xl">
      <h1 className="text-xl font-bold mb-4">
        {isEdit ? "Edit Driver" : "Add New Driver"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full border p-2 rounded"
            required
            disabled={loading}
          />
          {validationErrors.find((e) => e.field === "name") && (
            <div className="text-red-500 text-xs italic">
              {validationErrors.find((e) => e.field === "name")?.message}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            name="licenseNumber"
            value={form.licenseNumber}
            onChange={handleChange}
            placeholder="License Number"
            className="w-full border p-2 rounded"
            disabled={loading}
          />
          {validationErrors.find((e) => e.field === "licenseNumber") && (
            <div className="text-red-500 text-xs italic">
              {
                validationErrors.find((e) => e.field === "licenseNumber")
                  ?.message
              }
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full border p-2 rounded"
            disabled={loading}
          />
          {validationErrors.find((e) => e.field === "phoneNumber") && (
            <div className="text-red-500 text-xs italic">
              {validationErrors.find((e) => e.field === "phoneNumber")?.message}
            </div>
          )}
        </div>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          disabled={loading}
        >
          <option value="available">Available</option>
          <option value="on_trip">On Trip</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex items-center justify-end gap-2">
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
            {loading ? <Loader containerClassName="!py-0 !text-white" /> : isEdit ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
