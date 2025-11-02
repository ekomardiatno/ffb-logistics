import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import FleetOverview from '../FleetOverview';
import { configureStore } from '@reduxjs/toolkit';
import vehiclesReducer from '../../../store/vehiclesSlice';
import driversReducer from '../../../store/driversSlice';
import { expect, test } from 'vitest';

function renderWithStore(store: any) {
  return render(
    <Provider store={store}>
      <FleetOverview />
    </Provider>
  );
}

test('renders loading state initially', () => {
  const store = configureStore({
    reducer: { vehicles: vehiclesReducer, drivers: driversReducer },
  });

  renderWithStore(store);
  expect(screen.getByText(/loading fleet overview/i)).toBeInTheDocument();
});
