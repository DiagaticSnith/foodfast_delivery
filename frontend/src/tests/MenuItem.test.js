import { render, screen } from '@testing-library/react';
import MenuItem from '../components/MenuItem';

test('renders menu item', () => {
  render(<MenuItem item={{ id: 1, name: 'Pizza', price: 10 }} />);
  expect(screen.getByText('Pizza')).toBeInTheDocument();
});