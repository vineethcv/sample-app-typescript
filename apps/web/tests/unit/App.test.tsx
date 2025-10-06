
import { render, screen } from '@testing-library/react'
import React from 'react'

function AppStub() { return <div data-testid="greet">Hello from test</div> }

it('renders a basic element', () => {
  render(<AppStub/>)
  expect(screen.getByTestId('greet')).toHaveTextContent('Hello from test')
})
