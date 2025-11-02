import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import TripPlanner from "./components/trip/TripPlanner";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import DriverManager from "./components/management/DriverManagement";
import VehicleManager from "./components/management/VehicleManagement";
import TripList from "./components/trip/TripList";
import { useState } from "react";
import classNames from "classnames";
import { FaBars } from "react-icons/fa6";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="min-h-screen pt-16">
          <header className="bg-white shadow fixed top-0 left-0 right-0 z-50">
            {isSidebarOpen && (
              <div
                onClick={() => {
                  setIsSidebarOpen(false);
                }}
                className="fixed inset-0 bg-black opacity-25 md:hidden"
              />
            )}
            <div className="mx-auto max-w-7xl px-4 py-4 flex flex-row items-center justify-between">
              <span className="text-xl font-bold">FFB Logistics</span>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="size-10 rounded-md border border-gray-300 flex items-center justify-center md:hidden text-center"
              >
                <FaBars />
              </button>
              <nav
                className={classNames(
                  "flex flex-col md:flex-row items-start md:items-center justify-center md:justify-start gap-6 absolute md:static bg-white md:bg-transparent h-screen md:h-auto top-0 -right-full md:top-auto md:right-auto border-t md:border-t-0 border-gray-300 md:border-none py-4 md:py-0 px-6 md:px-0 shadow-md md:shadow-none",
                  {
                    "right-0": isSidebarOpen,
                  }
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `text-sm ${
                      isActive
                        ? "text-blue-700 font-medium"
                        : "text-gray-600 hover:text-gray-800"
                    }`
                  }
                  end
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/trip-list"
                  className={({ isActive }) =>
                    `text-sm ${
                      isActive
                        ? "text-blue-700 font-medium"
                        : "text-gray-600 hover:text-gray-800"
                    }`
                  }
                >
                  Trips
                </NavLink>
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-7xl px-4 py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/planner" element={<TripPlanner />} />
              <Route path="/trip-list" element={<TripList />} />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
