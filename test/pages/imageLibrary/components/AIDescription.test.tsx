import type { ReactElement, ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import AIDescription from '../../../../src/pages/imageLibrary/components/AIDescription'
import { useApiKey } from '../../../../src/context/ApiKeyContext'
import { useOpenAIImageDescriptionQuery } from '../../../../src/pages/imageLibrary/hooks/useOpenAIImageDescriptionQuery'

type PropsWithChildren = {
  children?: ReactNode
  [key: string]: unknown
}

const mockSkeleton = jest.fn<ReactElement, [Record<string, unknown>]>(() => (
  <div data-testid="description-skeleton" />
))
const mockTypography = jest.fn<ReactElement, [PropsWithChildren]>(({ children }) => (
  <p data-testid="ai-description">{children}</p>
))

jest.mock('@mui/material', () => ({
  Skeleton: (props: Record<string, unknown>) => mockSkeleton(props),
}))

jest.mock('@mui/material/Typography', () => ({
  __esModule: true,
  default: (props: PropsWithChildren) => mockTypography(props),
}))

jest.mock('../../../../src/context/ApiKeyContext', () => ({
  useApiKey: jest.fn(),
}))

jest.mock('../../../../src/pages/imageLibrary/hooks/useOpenAIImageDescriptionQuery', () => ({
  useOpenAIImageDescriptionQuery: jest.fn(),
}))

const mockUseApiKey = jest.mocked(useApiKey)
const mockUseDescriptionQuery = jest.mocked(useOpenAIImageDescriptionQuery)

describe('AIDescription', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when no API key is available', () => {
    mockUseApiKey.mockReturnValue({ apiKey: null } as ReturnType<typeof useApiKey>)
    mockUseDescriptionQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useOpenAIImageDescriptionQuery>)

    const { container } = render(<AIDescription imgSource="/image-one.jpg" />)

    expect(container).toBeEmptyDOMElement()
    expect(mockUseDescriptionQuery).toHaveBeenCalledWith(null, '/image-one.jpg')
  })

  it('renders a loading skeleton while the description is loading', () => {
    mockUseApiKey.mockReturnValue({ apiKey: 'sk-test-key' } as ReturnType<typeof useApiKey>)
    mockUseDescriptionQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useOpenAIImageDescriptionQuery>)

    render(<AIDescription imgSource="/image-one.jpg" />)

    expect(screen.getByTestId('description-skeleton')).toBeInTheDocument()
    expect(mockSkeleton).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'text',
      }),
    )
    expect(mockUseDescriptionQuery).toHaveBeenCalledWith('sk-test-key', '/image-one.jpg')
  })

  it('renders the AI-generated description when it has loaded', () => {
    mockUseApiKey.mockReturnValue({ apiKey: 'sk-test-key' } as ReturnType<typeof useApiKey>)
    mockUseDescriptionQuery.mockReturnValue({
      data: 'A quiet mountain lake at sunrise.',
      isLoading: false,
    } as ReturnType<typeof useOpenAIImageDescriptionQuery>)

    render(<AIDescription imgSource="/image-one.jpg" />)

    expect(screen.getByTestId('ai-description')).toHaveTextContent(
      'A quiet mountain lake at sunrise.',
    )
    expect(mockTypography).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'body1',
      }),
    )
  })
})
