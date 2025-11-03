import { screen, within } from '@testing-library/react';
import { renderWithStore } from '../../../test-utils';
import FleetOverview from '../FleetOverview';
import { expect, it, vi } from 'vitest';

// Mock the async actions
const mockFetchVehicles = vi.fn().mockImplementation(() => (dispatch: any) => {
  dispatch({ type: 'vehicles/fetch/pending' });
});

const mockFetchDrivers = vi.fn().mockImplementation(() => (dispatch: any) => {
  dispatch({ type: 'drivers/fetch/pending' });
});

vi.mock('../../../store/vehiclesSlice', () => ({
  __esModule: true,
  default: (state = { items: [], loading: false, error: null }) => state,
  fetchVehicles: () => mockFetchVehicles
}));

vi.mock('../../../store/driversSlice', () => ({
  __esModule: true,
  default: (state = { items: [], loading: false, error: null }) => state,
  fetchDrivers: () => mockFetchDrivers
}));

it('shows loader when loading', () => {
  const preloadedState = {
    vehicles: { items: [], loading: true, error: null },
    drivers: { items: [], loading: true, error: null },
  };
  renderWithStore(<FleetOverview />, { preloadedState });
  expect(screen.getByText('Loading fleet overview...')).toBeInTheDocument();
});

it('shows basic stats', () => {
  const preloadedState = {
    vehicles: { items: [{ id: 'v1', plateNumber: 'B-1', type: 'truk', capacity: 12, status: 'idle', driverId: 'd1' }], loading: false, error: null },
    drivers: { items: [{ id: 'd1', name: 'Jane', status: 'available', licenseNumber: 'L001', phoneNumber: '123456' }], loading: false, error: null },
  };
  renderWithStore(<FleetOverview />, { preloadedState });
  const totalLabel = screen.getByText(/Total Vehicles/i);
  expect(totalLabel).toBeInTheDocument();
  // find the value within the same Stat container to avoid matching other '1' values
  const totalContainer = totalLabel.parentElement as HTMLElement;
  expect(within(totalContainer).getByText('1')).toBeInTheDocument();
});

it('renders vehicle assignments correctly', () => {
  const preloadedState = {
    vehicles: {
      items: [
        { id: 'v1', plateNumber: 'B-1234', type: 'truk', capacity: 10, status: 'on_trip', driverId: 'd1' },
        { id: 'v2', plateNumber: 'B-5678', type: 'truk', capacity: 8, status: 'idle', driverId: null },
      ],
      loading: false,
      error: null
    },
    drivers: {
      items: [
        { id: 'd1', name: 'John Doe', status: 'on_trip', licenseNumber: 'L001', phoneNumber: '123456789' }
      ],
      loading: false,
      error: null
    }
  };
  renderWithStore(<FleetOverview />, { preloadedState });

  // Check vehicle with assigned driver
  expect(screen.getByText('B-1234')).toBeInTheDocument();
  expect(screen.getByText('TRUK • 10 ton(s)')).toBeInTheDocument();
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('ON TRIP')).toBeInTheDocument();

  // Check vehicle without driver
  expect(screen.getByText('B-5678')).toBeInTheDocument();
  expect(screen.getByText('TRUK • 8 ton(s)')).toBeInTheDocument();
  expect(screen.getByText('— Unassigned —')).toBeInTheDocument();
  expect(screen.getByText('IDLE')).toBeInTheDocument();
});