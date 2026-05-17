import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import ImageModal from '../../../src/components/imageModal/ImageModal'

type PropsWithChildren = {
  children?: ReactNode
  [key: string]: unknown
}

type ModalProps = PropsWithChildren & {
  open: boolean
  onClose: () => void
}

const mockMuiModal = jest.fn(({ children, onClose, open, ...props }: ModalProps) =>
  open ? (
    <section data-testid="mui-modal" data-props={JSON.stringify(props)}>
      <button type="button" onClick={onClose}>
        Close
      </button>
      {children}
    </section>
  ) : null,
)

const mockMuiTypography = jest.fn(({ children, id }: PropsWithChildren) => (
  <div id={id as string | undefined}>{children}</div>
))

jest.mock('@mui/material/Modal', () => ({
  __esModule: true,
  default: (props: ModalProps) => mockMuiModal(props),
}))

jest.mock('@mui/material/Typography', () => ({
  __esModule: true,
  default: (props: PropsWithChildren) => mockMuiTypography(props),
}))

describe('ImageModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not render modal content when closed', () => {
    render(
      <ImageModal
        open={false}
        onClose={jest.fn()}
        imgSource="/image-one.jpg"
        title="First image"
        subtitle="First subtitle"
      />,
    )

    expect(screen.queryByTestId('mui-modal')).not.toBeInTheDocument()
    expect(screen.queryByText('First image')).not.toBeInTheDocument()
  })

  it('renders the image, title, and subtitle when open', () => {
    render(
      <ImageModal
        open
        onClose={jest.fn()}
        imgSource="/image-one.jpg"
        title="First image"
        subtitle="First subtitle"
      />,
    )

    expect(screen.getByTestId('mui-modal')).toBeInTheDocument()
    expect(screen.getByAltText('First image')).toHaveAttribute('src', '/image-one.jpg')
    expect(screen.getByText('First image')).toBeInTheDocument()
    expect(screen.getByText('First subtitle')).toBeInTheDocument()
  })

  it('omits optional subtitle when it is not provided', () => {
    render(<ImageModal open onClose={jest.fn()} imgSource="/image-one.jpg" title="First image" />)

    const modalProps = JSON.parse(screen.getByTestId('mui-modal').dataset.props ?? '{}')

    expect(modalProps['aria-describedby']).toBeUndefined()
    expect(screen.getByText('First image')).toBeInTheDocument()
  })

  it('calls onClose when MUI modal requests closing', () => {
    const onClose = jest.fn()

    render(<ImageModal open onClose={onClose} imgSource="/image-one.jpg" title="First image" />)

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
