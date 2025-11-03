import { render, screen, fireEvent, within } from '@testing-library/react';
import EditTripModal from '../EditTripModal';
import { expect, it, vi } from 'vitest';

it('renders nothing when open is false', () => {
  const trip: any = { id: 't1', scheduledDate: new Date().toISOString(), estimatedDuration: 10, collections: [] };
  const mills: any[] = [];
  const onSave = vi.fn();
  const onClose = vi.fn();

  const { container } = render(
    <EditTripModal open={false} onClose={onClose} trip={trip} mills={mills} onSave={onSave} />
  );

  expect(container.firstChild).toBeNull();
});

it('shows validation error when no mills provided', () => {
  const trip: any = { id: 't1', scheduledDate: new Date().toISOString(), estimatedDuration: 10, collections: [] };
  const mills: any[] = [];
  const onSave = vi.fn();
  const onClose = vi.fn();

  render(<EditTripModal open={true} onClose={onClose} trip={trip} mills={mills} onSave={onSave} />);

  const saveBtn = screen.getByText('Save');
  fireEvent.click(saveBtn);

  expect(screen.getByText('Collection is required')).toBeInTheDocument();
  expect(onSave).not.toHaveBeenCalled();
});

it('shows validation error when duration is missing', () => {
  const trip: any = { id: 't1', scheduledDate: new Date().toISOString(), estimatedDuration: 0, collections: [{ millId: 'm1', collected: 2 }] };
  const mills: any[] = [{ id: 'm1', name: 'Mill A', avgDailyProduction: 10, contactPerson: 'X' }];
  const onSave = vi.fn();
  const onClose = vi.fn();

  render(<EditTripModal open={true} onClose={onClose} trip={trip} mills={mills} onSave={onSave} />);

  const saveBtn = screen.getByText('Save');
  fireEvent.click(saveBtn);

  expect(screen.getByText('Estimated duration is required')).toBeInTheDocument();
  expect(onSave).not.toHaveBeenCalled();
});

it('allows adding a mill, editing quantity and saving with correct payload', async () => {
  const now = new Date();
  const trip: any = { id: 't1', scheduledDate: now.toISOString(), estimatedDuration: 20, collections: [] };
  const mills: any[] = [
    { id: 'm1', name: 'Mill A', avgDailyProduction: 100, contactPerson: 'A' },
    { id: 'm2', name: 'Mill B', avgDailyProduction: 50, contactPerson: 'B' }
  ];
  const onSave = vi.fn();
  const onClose = vi.fn();

  render(<EditTripModal open={true} onClose={onClose} trip={trip} mills={mills} onSave={onSave} />);

  // Add Mill A using the select (+ Add Mill)
  const addSelect = screen.getByRole('combobox');
  fireEvent.change(addSelect, { target: { value: 'm1' } });

  // Mill A should appear in the rows with default 4 (ignore the <option> with the same text)
  const millElements = screen.getAllByText('Mill A');
  const millRow = millElements.find(el => el.tagName !== 'OPTION');
  expect(millRow).toBeTruthy();
  const rowDiv = millRow!.parentElement!.parentElement as HTMLElement;
  const qtyInput = within(rowDiv).getByDisplayValue('4') as HTMLInputElement;
  expect(qtyInput).toBeInTheDocument();

  // change quantity to 6
  fireEvent.change(qtyInput, { target: { value: '6' } });
  expect(qtyInput.value).toBe('6');

  // change duration (input has no label association, select by current display value)
  const durationInput = screen.getByDisplayValue('20') as HTMLInputElement;
  fireEvent.change(durationInput, { target: { value: '45' } });

  // click Save
  const saveBtn = screen.getByText('Save');
  fireEvent.click(saveBtn);

  // onSave should be called with scheduledDate and estimatedDuration and mills array
  expect(onSave).toHaveBeenCalledTimes(1);
  const payload = onSave.mock.calls[0][0];
  expect(payload).toHaveProperty('scheduledDate');
  expect(payload.estimatedDuration).toBe(45);
  expect(payload.mills).toEqual([{ millId: 'm1', plannedCollection: 6 }]);
});
