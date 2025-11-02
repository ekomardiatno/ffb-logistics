import { useMemo, useState } from "react";
import type { Mill, Trip } from "../../types";
import { createPortal } from "react-dom";
import { FaCircleExclamation } from "react-icons/fa6";

export default function EditTripModal({
  open, onClose, trip, mills, onSave
}: {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  mills: Mill[];
  onSave: (changes: { scheduledDate?: string; estimatedDuration?: number; mills?: { millId: string; plannedCollection: number }[] }) => void;
}) {
  const [date, setDate] = useState<string>(() => new Date(trip.scheduledDate).toISOString().slice(0,16));
  const [duration, setDuration] = useState<number>(trip.estimatedDuration);
  const [rows, setRows] = useState<{ millId: string; plannedCollection: number }[]>(
    (trip.collections || []).map(c => ({ millId: c.millId, plannedCollection: c.collected }))
  );
  const [error, setError] = useState<Error | null>(null)

  const capacity = 12; // per assignment
  const total = useMemo(() => rows.reduce((s, r) => s + (Number(r.plannedCollection) || 0), 0), [rows]);

  function setQty(millId: string, val: number) {
    setRows(rs => rs.map(r => r.millId === millId ? { ...r, plannedCollection: val } : r));
  }
  function addMill(m: Mill) {
    if (rows.find(r => r.millId === m.id)) return;
    setRows(rs => [...rs, { millId: m.id, plannedCollection: 4 }]);
  }
  function removeMill(id: string) {
    setRows(rs => rs.filter(r => r.millId !== id));
  }

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Trip</h3>
          <button className="rounded-lg px-2 py-1 text-sm hover:bg-gray-100" onClick={onClose}>Close</button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-gray-600">Scheduled</label>
            <input type="datetime-local" className="mt-1 w-full rounded-lg border px-3 py-2"
              value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Estimated Duration (min)</label>
            <input type="number" className="mt-1 w-full rounded-lg border px-3 py-2"
              value={duration} onChange={e => setDuration(Number(e.target.value))} />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm text-gray-600">Collections (Total {total} / {capacity} t)</div>
            <select
              className="rounded-lg border px-2 py-1 text-sm"
              onChange={e => { const m = mills.find(mm => mm.id === e.target.value); if (m) addMill(m); }}
            >
              <option value="">+ Add Mill</option>
              {mills.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            {rows.map(r => {
              const m = mills.find(mm => mm.id === r.millId);
              return (
                <div key={r.millId} className="flex items-center justify-between rounded-lg border p-2">
                  <div className="text-sm">{m?.name}</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min={0} step={0.5}
                      className="w-24 rounded-lg border px-2 py-1 text-right"
                      value={r.plannedCollection}
                      onChange={e => setQty(r.millId, Number(e.target.value))}
                    />
                    <span className="text-sm text-gray-600">t</span>
                    <button className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50" onClick={() => removeMill(r.millId)}>Remove</button>
                  </div>
                </div>
              );
            })}
            {rows.length === 0 && <div className="rounded-lg border border-dashed p-4 text-center text-gray-500">No mills.</div>}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          {error && (
            <div className="text-red-500 text-xs italic mr-auto flex items-center gap-1">
              <FaCircleExclamation />
              <span>{error.message}</span>
            </div>
          )}
          <button
            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
            onClick={onClose}
          >Cancel</button>
          <button
            disabled={total > capacity}
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
            onClick={() => {
              setError(null)
              if(mills.length < 1) {
                setError(new Error('Collection is required'))
                return;
              }
              if(!duration) {
                setError(new Error('Estimated duration is required'))
                return;
              }
              if(!date) {
                setError(new Error('Scheduled is required'))
                return;
              }
              onSave({
                scheduledDate: new Date(date).toISOString(),
                estimatedDuration: duration,
                mills: rows
              })
            }}
          >Save</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
