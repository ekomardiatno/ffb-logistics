import { screen, within } from '@testing-library/react';
import { renderWithStore } from '../../../test-utils';
import DailySummary from '../DailySummary';
import { expect, it, vi } from 'vitest';

// Mock async thunks so component's useEffect dispatches don't break tests
vi.mock('../../../store/tripsSlice', () => ({
  __esModule: true,
  default: (state = { items: [], loading: false, error: null }) => state,
  fetchTrips: () => (dispatch: any) => dispatch({ type: 'trips/fetch/pending' })
}));

vi.mock('../../../store/millsSlice', () => ({
  __esModule: true,
  default: (state = { items: [], loading: false, error: null }) => state,
  fetchMills: () => (dispatch: any) => dispatch({ type: 'mills/fetch/pending' })
}));

it('shows loader when loading', () => {
  const preloadedState = {
    trips: { items: [], loading: true, error: null },
    mills: { items: [], loading: true, error: null }
  };

  renderWithStore(<DailySummary />, { preloadedState });
  expect(screen.getByText('Loading daily summary...')).toBeInTheDocument();
});

it('displays todays trip stats correctly and mills list', () => {
  const today = new Date();
  const iso = today.toISOString();

  const preloadedState = {
    trips: {
      items: [
        { id: 't1', scheduledDate: iso, status: 'scheduled' },
        { id: 't2', scheduledDate: iso, status: 'in_progress' },
        { id: 't3', scheduledDate: iso, status: 'completed' },
        { id: 't4', scheduledDate: iso, status: 'completed' }
      ],
      loading: false,
      error: null
    },
    mills: {
      items: [
        { id: 'm1', name: 'Mill A', avgDailyProduction: 100, contactPerson: 'Alice' },
        { id: 'm2', name: 'Mill B', avgDailyProduction: 50, contactPerson: 'Bob' },
        { id: 'm3', name: 'Mill C', avgDailyProduction: 75, contactPerson: 'Carol' }
      ],
      loading: false,
      error: null
    }
  };

  renderWithStore(<DailySummary />, { preloadedState });

  // Scheduled Trips (Today) => 1
  const scheduledLabel = screen.getByText('Scheduled Trips (Today)');
  const scheduledContainer = scheduledLabel.parentElement as HTMLElement;
  expect(within(scheduledContainer).getByText('1')).toBeInTheDocument();

  // In Progress (Today) => 1
  const inProgLabel = screen.getByText('In Progress (Today)');
  const inProgContainer = inProgLabel.parentElement as HTMLElement;
  expect(within(inProgContainer).getByText('1')).toBeInTheDocument();

  // Completed Trips (Today) => 2
  const completedLabel = screen.getByText('Completed Trips (Today)');
  const completedContainer = completedLabel.parentElement as HTMLElement;
  expect(within(completedContainer).getByText('2')).toBeInTheDocument();

  // Check mills ordering: Mill A (100) should be present and show Avg/day
  const millA = screen.getByText('Mill A');
  expect(millA).toBeInTheDocument();
  const millAContainer = millA.parentElement as HTMLElement;
  expect(within(millAContainer).getByText(/Avg\/day:\s*100/)).toBeInTheDocument();
});
