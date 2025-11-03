import { screen, fireEvent } from '@testing-library/react';
import { renderWithStore } from '../../../test-utils';
import DriverForm from '../DriverForm';
import { expect, it, vi, beforeEach } from 'vitest';

// Mock react-router hooks
const mockNavigate = vi.fn();
let mockParams: Record<string, string | undefined> = {};
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

// Mock drivers slice thunks
const mockCreateDriver = vi.fn().mockImplementation((form) => (dispatch: any) => {
  dispatch({ type: 'drivers/create/pending' });
  const p: any = Promise.resolve({});
  p.unwrap = () => Promise.resolve({});
  return p;
});

const mockUpdateDriver = vi.fn().mockImplementation((payload) => (dispatch: any) => {
  dispatch({ type: 'drivers/update/pending' });
  const p: any = Promise.resolve({});
  p.unwrap = () => Promise.resolve({});
  return p;
});

vi.mock('../../../store/driversSlice', () => ({
  __esModule: true,
  default: (state = { items: [], loading: false, error: null }) => state,
  fetchDrivers: () => (dispatch: any) => dispatch({ type: 'drivers/fetch/pending' }),
  createDriver: (...args: any[]) => mockCreateDriver(...args),
  updateDriver: (...args: any[]) => mockUpdateDriver(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockReset();
  mockParams = {};
});

it('renders add form and creates driver on submit', async () => {
  const preloadedState = {
    drivers: { items: [], loading: false, error: null }
  };

  renderWithStore(<DriverForm />, { preloadedState });

  // Fill form
  const nameInput = screen.getByPlaceholderText('Name') as HTMLInputElement;
  const licenseInput = screen.getByPlaceholderText('License Number') as HTMLInputElement;
  const phoneInput = screen.getByPlaceholderText('Phone Number') as HTMLInputElement;
  const statusSelect = screen.getByRole('combobox') as HTMLSelectElement;
  const submitBtn = screen.getByRole('button', { name: /Create/i });

  fireEvent.change(nameInput, { target: { value: 'Alice' } });
  fireEvent.change(licenseInput, { target: { value: 'L123' } });
  fireEvent.change(phoneInput, { target: { value: '081234' } });
  fireEvent.change(statusSelect, { target: { value: 'available' } });

  // Submit
  fireEvent.click(submitBtn);

  // createDriver should be called with form data
  expect(mockCreateDriver).toHaveBeenCalledTimes(1);
  const calledWith = mockCreateDriver.mock.calls[0][0];
  expect(calledWith).toMatchObject({ name: 'Alice', licenseNumber: 'L123', phoneNumber: '081234', status: 'available' });

  // navigate back should be called
  // give microtask tick for promise resolution
  await Promise.resolve();
  expect(mockNavigate).toHaveBeenCalledWith(-1);
});

it('renders edit form and updates driver on submit', async () => {
  mockParams = { id: 'd1' };
  const preloadedState = {
    drivers: { items: [{ id: 'd1', name: 'Bob', licenseNumber: 'LX', phoneNumber: '089', status: 'on_trip' }], loading: false, error: null }
  };

  renderWithStore(<DriverForm />, { preloadedState });

  // Form should be prefilled
  const nameInput = screen.getByPlaceholderText('Name') as HTMLInputElement;
  expect(nameInput.value).toBe('Bob');

  // Change name and submit
  fireEvent.change(nameInput, { target: { value: 'Bobby' } });
  const submitBtn = screen.getByRole('button', { name: /Save|Create/i });
  fireEvent.click(submitBtn);

  expect(mockUpdateDriver).toHaveBeenCalledTimes(1);
  const payload = mockUpdateDriver.mock.calls[0][0];
  expect(payload).toMatchObject({ id: 'd1', changes: expect.any(Object) });

  await Promise.resolve();
  expect(mockNavigate).toHaveBeenCalledWith(-1);
});
