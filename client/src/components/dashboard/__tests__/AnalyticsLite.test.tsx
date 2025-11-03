import { screen, within } from '@testing-library/react';
import { renderWithStore } from '../../../test-utils';
import AnalyticsLite from '../AnalyticsLite';
import { expect, it } from 'vitest';

it('renders today counts correctly in the 7-day analytics', () => {
  const today = new Date();
  const isoToday = today.toISOString();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);
  const isoTwoDays = twoDaysAgo.toISOString();

  const preloadedState = {
    trips: {
      items: [
        { id: 'a', scheduledDate: isoToday, status: 'scheduled' },
        { id: 'b', scheduledDate: isoToday, status: 'scheduled' },
        { id: 'c', scheduledDate: isoToday, status: 'in_progress' },
        { id: 'd', scheduledDate: isoToday, status: 'completed' },
        { id: 'e', scheduledDate: isoTwoDays, status: 'completed' }
      ],
      loading: false,
      error: null
    }
  };

  renderWithStore(<AnalyticsLite />, { preloadedState });

  const todayLabel = screen.getByText(today.toDateString());
  expect(todayLabel).toBeInTheDocument();
  const todayRow = todayLabel.parentElement as HTMLElement;
  // within row: Scheduled -> 2
  expect(within(todayRow).getByText('2')).toBeInTheDocument();
  // In Progress -> 1 (scope to In Progress bar)
  const inProgLabel = within(todayRow).getByText('In Progress');
  const inProgBar = inProgLabel.parentElement as HTMLElement;
  expect(within(inProgBar).getByText('1')).toBeInTheDocument();
  // Completed -> 1 (scope to Completed bar)
  const completedLabel = within(todayRow).getByText('Completed');
  const completedBar = completedLabel.parentElement as HTMLElement;
  expect(within(completedBar).getByText('1')).toBeInTheDocument();

  // twoDaysAgo row should show at least the completed count 1
  const twoDaysLabel = screen.getByText(twoDaysAgo.toDateString());
  const twoDaysRow = twoDaysLabel.parentElement as HTMLElement;
  expect(within(twoDaysRow).getByText('1')).toBeInTheDocument();
});

it('renders zeros when there are no trips', () => {
  const preloadedState = { trips: { items: [], loading: false, error: null } };
  renderWithStore(<AnalyticsLite />, { preloadedState });

  // Ensure 7 date rows are rendered by checking that today's date exists and its values are 0
  const today = new Date();
  const todayLabel = screen.getByText(today.toDateString());
  const todayRow = todayLabel.parentElement as HTMLElement;
  // Each bar shows a numeric value; for today we expect '0' for scheduled/in progress/completed
  // There will be three '0's in the row (one per bar)
  const zeros = within(todayRow).getAllByText('0');
  expect(zeros.length).toBeGreaterThanOrEqual(3);
});
