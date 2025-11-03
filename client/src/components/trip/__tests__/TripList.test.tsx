import { screen, fireEvent } from '@testing-library/react';
import { renderWithStore } from '../../../test-utils';
import TripList from '../TripList';
import { expect, it, vi } from 'vitest';

// mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// mock TripRowActions to keep test focused
vi.mock('../TripRowActions', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid={`actions-${props.tripId}`} />,
}));

// mock slices and their fetch thunks
vi.mock('../../../store/tripsSlice', () => ({
  __esModule: true,
  default: (state = { items: [], loading: false, error: null }) => state,
  fetchTrips: () => (dispatch: any) => dispatch({ type: 'trips/fetch/pending' }),
}));

vi.mock('../../../store/vehiclesSlice', () => ({
  __esModule: true,
  default: (state = { items: [], loading: false, error: null }) => state,
  fetchVehicles: () => (dispatch: any) => dispatch({ type: 'vehicles/fetch/pending' }),
}));

vi.mock('../../../store/driversSlice', () => ({
  __esModule: true,
  default: (state = { items: [], loading: false, error: null }) => state,
  fetchDrivers: () => (dispatch: any) => dispatch({ type: 'drivers/fetch/pending' }),
}));

it('shows loader when trips loading', () => {
  const preloadedState = {
    trips: { items: [], loading: true, error: null },
    vehicles: { items: [], loading: false, error: null },
    drivers: { items: [], loading: false, error: null },
  };
  renderWithStore(<TripList />, { preloadedState });
  expect(screen.getByText('Loading trips...')).toBeInTheDocument();
});

it('renders a trip row and supports navigation to planner', () => {
  const now = new Date().toISOString();
  const preloadedState = {
    trips: {
      items: [
        {
          id: 't1',
          scheduledDate: now,
          vehicleId: 'veh1',
          driverId: 'drv1',
          status: 'scheduled',
          estimatedDuration: 30,
          collections: [{ collected: 5 }, { collected: 2 }],
        },
      ],
      loading: false,
      error: null,
    },
    vehicles: { items: [{ id: 'veh1', plateNumber: 'ABC-1' }], loading: false, error: null },
    drivers: { items: [{ id: 'drv1', name: 'John' }], loading: false, error: null },
  };

  renderWithStore(<TripList />, { preloadedState });

  // plate number and driver
  expect(screen.getByText('ABC-1')).toBeInTheDocument();
  expect(screen.getByText('John')).toBeInTheDocument();
  // status text
  expect(screen.getByText('scheduled')).toBeInTheDocument();
  // estimated duration
  expect(screen.getByText('30 min')).toBeInTheDocument();
  // total collections
  expect(screen.getByText('7 ton(s)')).toBeInTheDocument();
  // actions component present
  expect(screen.getByTestId('actions-t1')).toBeInTheDocument();

  // Click Create Trip button -> navigate called
  const createBtn = screen.getByText('Create Trip');
  fireEvent.click(createBtn);
  expect(mockNavigate).toHaveBeenCalledWith('/planner');
});

it('filters by status', () => {
  const now = new Date().toISOString();
  const preloadedState = {
    trips: {
      items: [
        { id: 't1', scheduledDate: now, vehicleId: 'veh1', driverId: 'drv1', status: 'scheduled', estimatedDuration: 10, collections: [] },
        { id: 't2', scheduledDate: now, vehicleId: 'veh2', driverId: 'drv2', status: 'completed', estimatedDuration: 15, collections: [] },
      ],
      loading: false,
      error: null,
    },
    vehicles: { items: [{ id: 'veh1', plateNumber: 'P1' }, { id: 'veh2', plateNumber: 'P2' }], loading: false, error: null },
    drivers: { items: [{ id: 'drv1', name: 'A' }, { id: 'drv2', name: 'B' }], loading: false, error: null },
  };

  renderWithStore(<TripList />, { preloadedState });

  // set status select to 'scheduled'
  const statusSelect = screen.getByDisplayValue('All') as HTMLSelectElement;
  fireEvent.change(statusSelect, { target: { value: 'scheduled' } });

  // only scheduled row should be visible
  expect(screen.getByText('P1')).toBeInTheDocument();
  expect(screen.queryByText('P2')).not.toBeInTheDocument();
});

it('shows empty state when no trips', () => {
  const preloadedState = {
    trips: { items: [], loading: false, error: null },
    vehicles: { items: [], loading: false, error: null },
    drivers: { items: [], loading: false, error: null },
  };
  renderWithStore(<TripList />, { preloadedState });
  expect(screen.getByText('No trips found')).toBeInTheDocument();
});
