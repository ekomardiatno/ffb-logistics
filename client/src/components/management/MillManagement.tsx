import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { fetchMills } from "../../store/millsSlice";

export default function MillManager() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: mills, loading } = useAppSelector((s) => s.mills);

  useEffect(() => {
    dispatch(fetchMills());
  }, [dispatch]);

  if (loading) return <Loader label="Loading mills..." />;

  return (
    <Card
      title="Mill Management"
      right={
        <button
          onClick={() => navigate("/mills/new")}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg"
        >
          + Add Mill
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="uppercase text-gray-500 bg-gray-100 text-xs">
            <tr>
              <th className="p-2 py-3 border border-gray-300">Name</th>
              <th className="p-2 py-3 border border-gray-300">Contact</th>
              <th className="p-2 py-3 border border-gray-300">Location</th>
              <th className="p-2 py-3 border border-gray-300">Avg Daily Production (tons)</th>
              <th className="p-2 py-3 border border-gray-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mills.map((m) => (
              <tr key={m.id} className="border-b">
                <td className="p-2 border border-gray-300">{m.name}</td>
                <td className="p-2 border border-gray-300">{m.contactPerson}</td>
                <td className="p-2 border border-gray-300"><pre>{JSON.stringify(m.location)}</pre></td>
                <td className="p-2 border border-gray-300">{m.avgDailyProduction}</td>
                <td className="p-2 border border-gray-300 text-right space-x-2">
                  <button
                    onClick={() => navigate(`/mills/${m.id}/edit`)}
                    className="px-2 py-1 text-xs border rounded"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {mills.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4">
                  No mills available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
