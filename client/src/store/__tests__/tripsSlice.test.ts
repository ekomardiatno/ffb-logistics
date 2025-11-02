import { Trip } from '../../types';
import tripsReducer, { fetchTrips } from '../tripsSlice';
import { expect, describe, it } from 'vitest';

describe('tripsSlice', () => {
  it('should return initial state', () => {
    const state = tripsReducer(undefined, { type: 'unknown' });
    expect(state.items).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('should set loading when fetching trips', () => {
    const state = tripsReducer(undefined, fetchTrips.pending('', undefined));
    expect(state.loading).toBe(true);
  });

  it('should store trips on success', () => {
    const mockTrips: Trip[] = [{ id: '1', status: 'scheduled', scheduledDate: new Date().toISOString(), driverId: '1', estimatedDuration: 120, vehicleId: '1' }];
    const state = tripsReducer(undefined, fetchTrips.fulfilled(mockTrips, '', undefined));
    expect(state.items).toEqual(mockTrips);
    expect(state.loading).toBe(false);
  });
});
