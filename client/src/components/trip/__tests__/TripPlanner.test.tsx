import { fireEvent, screen } from '@testing-library/react';
import { renderWithStore } from '../../../test-utils';
import TripPlanner from '../TripPlanner';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';

it('shows red capacity when exceeded', async () => {
  const preloadedState = {
    vehicles: { items: [{ id: 'v1', plateNumber: 'B1', type: 'truck', capacity: 10, status: 'idle' }], loading: false, error: null },
    drivers: { items: [{ id: 'd1', name: 'Jane', status: 'available' }], loading: false, error: null },
    mills: { items: [{ id: 'm1', name: 'Mill A', contactPerson: 'X', location: 'Loc', avgDailyProduction: 100 }], loading: false, error: null },
    trips: { items: [], loading: false, error: null },
  };

  renderWithStore(
    <MemoryRouter>
      <TripPlanner />
    </MemoryRouter>,
    { preloadedState }
  );

  fireEvent.change(screen.getByText('Vehicle').closest('div')!.querySelector('select')!, { target: { value: 'v1' } });
  fireEvent.change(screen.getByText('Driver').closest('div')!.querySelector('select')!, { target: { value: 'd1' } });

  fireEvent.click(screen.getByRole('button', { name: /Mill A/i }));

  fireEvent.change(screen.getByDisplayValue(/6/), { target: { value: '12' } });

  const plannedText = screen.getByText(/12\s+ton/);
  expect(plannedText.className).toMatch(/text-red-600/);
});
