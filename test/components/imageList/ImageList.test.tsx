import type { ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import ImageList from '../../../src/components/imageList/ImageList'

type PropsWithChildren = {
  children?: ReactNode
  [key: string]: unknown
}

const mockMuiImageList = jest.fn(({ children, ...props }: PropsWithChildren) => (
  <div data-testid="mui-image-list" data-props={JSON.stringify(props)}>
    {children}
  </div>
))
const mockImageListItem = jest.fn(({ children, ...props }: PropsWithChildren) => (
  <div data-testid="mui-image-list-item" {...props}>
    {children}
  </div>
))
const mockImageListItemBar = jest.fn((props: Record<string, unknown>) => (
  <div data-testid="mui-image-list-item-bar" data-props={JSON.stringify(props)} />
))
const mockSkeleton = jest.fn((props: Record<string, unknown>) => (
  <div data-testid="mui-skeleton" data-props={JSON.stringify(props)} />
))

jest.mock('@mui/material/ImageList', () => ({
  __esModule: true,
  default: (props: PropsWithChildren) => mockMuiImageList(props),
}))

jest.mock('@mui/material/ImageListItem', () => ({
  __esModule: true,
  default: (props: PropsWithChildren) => mockImageListItem(props),
}))

jest.mock('@mui/material/ImageListItemBar', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => mockImageListItemBar(props),
}))

jest.mock('@mui/material/Skeleton', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => mockSkeleton(props),
}))

describe('ImageList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the MUI image list', () => {
    render(<ImageList itemData={[]} />)

    expect(mockMuiImageList).toHaveBeenCalledTimes(1)
  })

  it('passes item metadata to MUI item bars and renders image props', () => {
    render(
      <ImageList
        itemData={[
          {
            imgSource: '/image-one.jpg',
            title: 'First image',
            subtitle: 'First subtitle',
          },
          {
            imgSource: '/image-two.jpg',
            title: 'Second image',
          },
        ]}
      />,
    )

    expect(mockImageListItem).toHaveBeenCalledTimes(2)
    expect(mockImageListItemBar).toHaveBeenNthCalledWith(1, {
      title: 'First image',
      subtitle: 'First subtitle',
      position: 'below',
    })
    expect(mockImageListItemBar).toHaveBeenNthCalledWith(2, {
      title: 'Second image',
      subtitle: undefined,
      position: 'below',
    })

    expect(screen.getByAltText('First image')).toHaveAttribute(
      'src',
      '/image-one.jpg?w=250&fit=crop&auto=format',
    )
    expect(screen.getByAltText('Second image')).toHaveAttribute('loading', 'lazy')
  })

  it('shows an image skeleton until the image loads', () => {
    render(
      <ImageList
        itemData={[
          {
            imgSource: '/image-one.jpg',
            title: 'First image',
          },
        ]}
      />,
    )

    const image = screen.getByAltText('First image')

    expect(screen.getByTestId('mui-skeleton')).toBeInTheDocument()
    expect(image).toHaveClass('image-with-skeleton_image', 'hidden')

    fireEvent.load(image)

    expect(screen.queryByTestId('mui-skeleton')).not.toBeInTheDocument()
    expect(image).toHaveClass('image-with-skeleton_image', 'loaded')
  })

  it('calls onImageClick with the clicked item data', () => {
    const onImageClick = jest.fn()
    const firstImage = {
      imgSource: '/image-one.jpg',
      title: 'First image',
      subtitle: 'First subtitle',
    }
    const secondImage = {
      imgSource: '/image-two.jpg',
      title: 'Second image',
    }

    render(<ImageList itemData={[firstImage, secondImage]} onImageClick={onImageClick} />)

    fireEvent.click(screen.getAllByTestId('mui-image-list-item')[1])

    expect(onImageClick).toHaveBeenCalledTimes(1)
    expect(onImageClick).toHaveBeenCalledWith(secondImage)
  })

  it('renders skeleton placeholders when loading', () => {
    render(
      <ImageList
        loading
        itemData={[
          {
            imgSource: '/image-one.jpg',
            title: 'First image',
          },
        ]}
      />,
    )

    expect(mockImageListItem).toHaveBeenCalledTimes(10)
    expect(mockSkeleton).toHaveBeenCalledTimes(30)
    expect(mockImageListItemBar).not.toHaveBeenCalled()
    expect(screen.queryByAltText('First image')).not.toBeInTheDocument()
  })
})
