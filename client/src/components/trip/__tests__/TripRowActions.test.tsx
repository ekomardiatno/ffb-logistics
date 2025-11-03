import { screen, fireEvent } from '@testing-library/react';
import { renderWithStore } from '../../../test-utils';
import TripRowActions from '../TripRowActions';
import { expect, it, vi, beforeEach } from 'vitest';

// Mock EditTripModal used inside TripRowActions
vi.mock('../EditTripModal', () => ({
  __esModule: true,
  default: ({ open, onClose, onSave }: any) => {
    if (!open) return null;
    return (
      <div>
        <button data-testid="modal-save" onClick={() => onSave({ estimatedDuration: 99 })}>Save</button>
        <button data-testid="modal-close" onClick={onClose}>Close</button>
      </div>
    );
  }
}));

// Mock trips slice thunks
const mockUpdateTripStatus = vi.fn().mockImplementation((payload) => (dispatch: any) => {
  dispatch({ type: 'trips/updateStatus/pending' });
  return Promise.resolve({});
});
const mockDeleteTrip = vi.fn().mockImplementation((id) => (dispatch: any) => {
  dispatch({ type: 'trips/delete/pending' });
  return Promise.resolve({});
});
const mockUpdateTrip = vi.fn().mockImplementation((payload) => (dispatch: any) => {
  dispatch({ type: 'trips/update/pending' });
  return Promise.resolve({});
});

vi.mock('../../../store/tripsSlice', () => ({
  __esModule: true,
  default: (state = { items: [], loading: false, error: null }) => state,
  updateTripStatus: (...args: any[]) => mockUpdateTripStatus(...args),
  deleteTrip: (...args: any[]) => mockDeleteTrip(...args),
  updateTrip: (...args: any[]) => mockUpdateTrip(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // default confirm true
  // @ts-ignore
  global.confirm = () => true;
});

it('changes status when select value changes', async () => {
  const now = new Date().toISOString();
  const preloadedState = {
    trips: { items: [{ id: 't1', scheduledDate: now, status: 'scheduled', vehicleId: 'v1', estimatedDuration: 0, collections: [] }], loading: false, error: null },
    mills: { items: [], loading: false, error: null }
  };

  renderWithStore(<TripRowActions tripId="t1" />, { preloadedState });

  const statusSelect = screen.getByRole('combobox') as HTMLSelectElement;
  expect(statusSelect.value).toBe('scheduled');
  fireEvent.change(statusSelect, { target: { value: 'in_progress' } });

  // allow any async dispatch to run
  await Promise.resolve();

  expect(mockUpdateTripStatus).toHaveBeenCalledTimes(1);
  expect(mockUpdateTripStatus.mock.calls[0][0]).toEqual({ id: 't1', status: 'in_progress' });
});

it('deletes when delete confirmed', async () => {
  const now = new Date().toISOString();
  const preloadedState = {
    trips: { items: [{ id: 't1', scheduledDate: now, status: 'scheduled', vehicleId: 'v1', estimatedDuration: 0, collections: [] }], loading: false, error: null },
    mills: { items: [], loading: false, error: null }
  };

  // confirm true
  // @ts-ignore
  global.confirm = () => true;

  renderWithStore(<TripRowActions tripId="t1" />, { preloadedState });

  const deleteBtn = screen.getByText('Delete');
  fireEvent.click(deleteBtn);

  await Promise.resolve();

  expect(mockDeleteTrip).toHaveBeenCalledTimes(1);
  expect(mockDeleteTrip.mock.calls[0][0]).toBe('t1');
});

it('does not delete when delete cancelled', async () => {
  const now = new Date().toISOString();
  const preloadedState = {
    trips: { items: [{ id: 't1', scheduledDate: now, status: 'scheduled', vehicleId: 'v1', estimatedDuration: 0, collections: [] }], loading: false, error: null },
    mills: { items: [], loading: false, error: null }
  };

  // confirm false
  // @ts-ignore
  global.confirm = () => false;

  renderWithStore(<TripRowActions tripId="t1" />, { preloadedState });

  const deleteBtn = screen.getByText('Delete');
  fireEvent.click(deleteBtn);

  await Promise.resolve();

  expect(mockDeleteTrip).not.toHaveBeenCalled();
});

it('opens modal and saves updates via updateTrip', async () => {
  const now = new Date().toISOString();
  const preloadedState = {
    trips: { items: [{ id: 't1', scheduledDate: now, status: 'scheduled', vehicleId: 'v1', estimatedDuration: 0, collections: [] }], loading: false, error: null },
    mills: { items: [], loading: false, error: null }
  };

  renderWithStore(<TripRowActions tripId="t1" />, { preloadedState });

  const editBtn = screen.getByText('Edit');
  fireEvent.click(editBtn);

  // modal save button should appear
  const modalSave = await screen.findByTestId('modal-save');
  fireEvent.click(modalSave);

  await Promise.resolve();

  expect(mockUpdateTrip).toHaveBeenCalledTimes(1);
  const calledWith = mockUpdateTrip.mock.calls[0][0];
  expect(calledWith).toMatchObject({ id: 't1', changes: { estimatedDuration: 99 } });
});
