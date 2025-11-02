import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { deleteTrip, updateTrip, updateTripStatus } from "../../store/tripsSlice";
import EditTripModal from "./EditTripModal";

export default function TripRowActions({ tripId }: { tripId: string }) {
  const dispatch = useAppDispatch();
  const trip = useAppSelector(s => s.trips.items.find(t => t.id === tripId))!;
  const mills = useAppSelector(s => s.mills.items);
  const [open, setOpen] = useState(false);

  async function changeStatus(status: typeof trip.status) {
    await dispatch(updateTripStatus({ id: tripId, status }));
  }

  async function remove() {
    if (!confirm("Delete this trip?")) return;
    await dispatch(deleteTrip(tripId));
  }

  return (
    <div className="flex items-center gap-2">
      <select
        className="rounded-lg border px-2 py-1 text-xs"
        value={trip.status}
        onChange={e => changeStatus(e.target.value as any)}
      >
        {
          ['scheduled', 'in_progress', 'completed', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.split('_').join(' ').toUpperCase()}</option>
          ))
        }
      </select>
      <button className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50" onClick={() => setOpen(true)}>Edit</button>
      <button className="rounded-lg border px-2 py-1 text-xs text-red-600 hover:bg-red-50" onClick={remove}>Delete</button>

      <EditTripModal
        open={open}
        onClose={() => setOpen(false)}
        trip={trip}
        mills={mills}
        onSave={async (changes) => {
          await dispatch(updateTrip({ id: tripId, changes }));
          setOpen(false);
        }}
      />
    </div>
  );
}
