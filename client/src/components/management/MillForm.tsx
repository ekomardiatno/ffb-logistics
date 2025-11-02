import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { createMill, updateMill, fetchMills } from "../../store/millsSlice";
import { Mill } from "../../types";

export default function MillForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const mill = useAppSelector(s => s.mills.items.find(m => m.id === id));
  const [latInput, setLatInput] = useState<string>("");
  const [lngInput, setLngInput] = useState<string>("");
  const [avgProdInput, setAvgProdInput] = useState<string>("");

  const [form, setForm] = useState<Omit<Mill, "id">>({
    name: "",
    contactPerson: "",
    location: {
      lat: 0,
      lng: 0,
    },
    avgDailyProduction: 0,
    phoneNumber: "",
  });

  useEffect(() => {
    if (isEdit && !mill) dispatch(fetchMills());
    if (mill) {
      setForm(mill);
      setLatInput((typeof mill.location === 'string' ? JSON.parse(mill.location) : mill.location).lat?.toString() || '');
      setLngInput((typeof mill.location === 'string' ? JSON.parse(mill.location) : mill.location).lng?.toString() || '');
      setAvgProdInput(mill.avgDailyProduction.toString());
    }
  }, [isEdit, mill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await dispatch(updateMill({ id: id!, data: form }));
    } else {
      await dispatch(createMill(form));
    }
    navigate(-1);
  };

  const timeoutInput = React.useRef<NodeJS.Timeout | null>(null);

  return (
    <div className="max-w-lg mx-auto bg-white shadow p-6 rounded-xl">
      <h1 className="text-xl font-bold mb-4">
        {isEdit ? "Edit Mill" : "Add New Mill"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Mill Name"
          className="w-full p-2 border rounded"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Contact Person"
          className="w-full p-2 border rounded"
          value={form.contactPerson}
          onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
        />
        <input
          placeholder="Latitude"
          className="w-full p-2 border rounded"
          value={latInput}
          onChange={(e) => {
            setLatInput(e.target.value);
            if(timeoutInput.current) clearTimeout(timeoutInput.current);
            timeoutInput.current = setTimeout(() => {
              if(isNaN(Number(e.target.value))) {
                setLatInput((typeof form.location === 'string' ? JSON.parse(form.location) : form.location).lat?.toString() || '')
                return
              }
              setForm({ ...form, location: { ...(typeof form.location === 'string' ? JSON.parse(form.location) : form.location), lat: Number(e.target.value) } })
              setLatInput(Number(e.target.value).toString())
            }, 800);
          }}
        />
        <input
          placeholder="Longitude"
          className="w-full p-2 border rounded"
          value={lngInput}
          onChange={(e) => {
            setLngInput(e.target.value);
            if(timeoutInput.current) clearTimeout(timeoutInput.current);
            timeoutInput.current = setTimeout(() => {
              if(isNaN(Number(e.target.value))) {
                setLngInput((typeof form.location === 'string' ? JSON.parse(form.location) : form.location).lng?.toString() || '')
                return
              }
              setForm({ ...form, location: { ...(typeof form.location === 'string' ? JSON.parse(form.location) : form.location), lng: Number(e.target.value) } })
              setLngInput(Number(e.target.value).toString())
            }, 800);
          }}
        />
        <input
          type="number"
          placeholder="Avg Daily Production (tons)"
          className="w-full p-2 border rounded"
          value={avgProdInput}
          onChange={(e) => {
            setAvgProdInput(e.target.value);
            if(timeoutInput.current) clearTimeout(timeoutInput.current);
            timeoutInput.current = setTimeout(() => {
              if(isNaN(Number(e.target.value))) {
                setAvgProdInput(form.avgDailyProduction.toString())
                return
              }
              setForm({ ...form, avgDailyProduction: Number(e.target.value) })
              setAvgProdInput(Number(e.target.value).toString())
            }, 800);
          }}
        />
        <input
          placeholder="Phone Number"
          className="w-full p-2 border rounded"
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
        />
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={() => navigate(-1)} className="border px-4 py-2 rounded">
            Cancel
          </button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
