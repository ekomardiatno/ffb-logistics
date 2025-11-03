import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import thunk from 'redux-thunk';

export function renderWithStore(
  ui: React.ReactElement,
  {
    preloadedState,
    store = configureStore({
      reducer: {
        drivers: (state = { items: [], loading: false, error: null }) => state,
        vehicles: (state = { items: [], loading: false, error: null }) => state,
        mills: (state = { items: [], loading: false, error: null }) => state,
        trips: (state = { items: [], loading: false, error: null }) => state
      },
      middleware: [thunk],
      preloadedState
    }),
    ...renderOptions
  }: any = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
