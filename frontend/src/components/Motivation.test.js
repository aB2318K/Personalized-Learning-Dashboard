import React from 'react';
import { render, screen } from '@testing-library/react';
import Motivation from './Motivation';

jest.mock('../assets/quotes', () => ({
  quotes: [
    { type: 'Motivation', text: 'Stay strong!' },
    { type: 'Learning Tip', text: 'Keep reading!' }
  ]
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders a motivation quote', () => {
    render(<Motivation type="Motivation" />);
    expect(screen.getByText(/stay strong!/i)).toBeInTheDocument();
});

test('renders a learning tip quote', () => {
    render(<Motivation type="Learning Tip" />);
    expect(screen.getByText(/keep reading!/i)).toBeInTheDocument();
});
