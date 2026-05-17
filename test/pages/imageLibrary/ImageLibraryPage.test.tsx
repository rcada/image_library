import type { ChangeEvent, ReactElement } from 'react'
import { act, render, screen } from '@testing-library/react'
import ImageLibraryPage from '../../../src/pages/imageLibrary/ImageLibraryPage'
import {
  type PicsumImage,
  usePicsumImagesQuery,
} from '../../../src/pages/imageLibrary/hooks/usePicsumImagesQuery'

const mockPagination = jest.fn<ReactElement, [Record<string, unknown>]>(() => (
  <nav data-testid="pagination" />
))
const mockImageList = jest.fn<ReactElement, [Record<string, unknown>]>(() => (
  <section data-testid="image-list" />
))

jest.mock('@mui/material/Pagination', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => mockPagination(props),
}))

jest.mock('../../../src/components/imageList/ImageList', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => mockImageList(props),
}))

jest.mock('../../../src/pages/imageLibrary/hooks/usePicsumImagesQuery', () => ({
  usePicsumImagesQuery: jest.fn(),
}))

const mockUseImagesQuery = jest.mocked(usePicsumImagesQuery)

describe('ImageLibraryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockImagesQuery = (data: PicsumImage[] = []) => {
    const getImagesPage = jest.fn<Promise<PicsumImage[]>, [number]>()

    mockUseImagesQuery.mockReturnValue({
      data,
      getImagesPage,
    } as unknown as ReturnType<typeof usePicsumImagesQuery>)

    return getImagesPage
  }

  it('renders pagination above the image list', () => {
    mockImagesQuery()

    const { container } = render(<ImageLibraryPage />)

    expect(screen.getByTestId('pagination')).toBeInTheDocument()
    expect(screen.getByTestId('image-list')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('image-library-page')
    expect(
      screen.getByTestId('pagination').compareDocumentPosition(screen.getByTestId('image-list')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('maps image url and author into image list item data', () => {
    mockImagesQuery([
      {
        id: 'one',
        author: 'Some author',
        width: 1200,
        height: 800,
        url: 'https://picsum.photos/id/1',
        download_url: 'https://picsum.photos/id/1/1200/800',
      },
      {
        id: 'two',
        author: 'Ada Lovelace',
        width: 900,
        height: 600,
        url: 'https://picsum.photos/id/2',
        download_url: 'https://picsum.photos/id/2/900/600',
      },
    ])

    render(<ImageLibraryPage />)

    expect(mockImageList).toHaveBeenCalledWith({
      itemData: [
        {
          imgSource: 'https://picsum.photos/id/1/1200/800',
          title: 'Some author',
        },
        {
          imgSource: 'https://picsum.photos/id/2/900/600',
          title: 'Ada Lovelace',
        },
      ],
    })
  })

  it('fetches and displays images for the selected page', async () => {
    const getImagesPage = mockImagesQuery([
      {
        id: 'one',
        author: 'Initial Author',
        width: 1200,
        height: 800,
        url: 'https://picsum.photos/id/1',
        download_url: 'https://picsum.photos/id/1/1200/800',
      },
    ])
    getImagesPage.mockResolvedValue([
      {
        id: 'two',
        author: 'Next Page Author',
        width: 900,
        height: 600,
        url: 'https://picsum.photos/id/2',
        download_url: 'https://picsum.photos/id/2/900/600',
      },
    ])

    render(<ImageLibraryPage />)

    const onChange = mockPagination.mock.calls[0][0].onChange as (
      event: ChangeEvent<unknown>,
      page: number,
    ) => void

    await act(async () => {
      onChange({} as ChangeEvent<unknown>, 2)
    })

    expect(getImagesPage).toHaveBeenCalledWith(2)
    expect(mockPagination).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 2,
      }),
    )
    expect(mockImageList).toHaveBeenLastCalledWith({
      itemData: [
        {
          imgSource: 'https://picsum.photos/id/2/900/600',
          title: 'Next Page Author',
        },
      ],
    })
  })
})
