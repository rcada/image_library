import { render, screen } from '@testing-library/react'
import App from '../src/App'

jest.mock('../src/pages/imageLibrary/ImageLibraryPage', () => ({
  __esModule: true,
  default: () => <div data-testid="image-library-page" />,
}))

describe('App', () => {
  it('renders the image library page', () => {
    render(<App />)

    expect(screen.getByTestId('image-library-page')).toBeInTheDocument()
  })
})
