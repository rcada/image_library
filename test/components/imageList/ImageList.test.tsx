import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
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
const mockImageListItem = jest.fn(({ children }: PropsWithChildren) => (
  <div data-testid="mui-image-list-item">{children}</div>
))
const mockImageListItemBar = jest.fn((props: Record<string, unknown>) => (
  <div data-testid="mui-image-list-item-bar" data-props={JSON.stringify(props)} />
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

describe('ImageList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('passes fixed sizing props to the MUI image list', () => {
    render(<ImageList itemData={[]} />)

    expect(mockMuiImageList).toHaveBeenCalledTimes(1)
    expect(mockMuiImageList.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        sx: { width: 500, height: 450 },
      }),
    )
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
      '/image-one.jpg?w=248&fit=crop&auto=format',
    )
    expect(screen.getByAltText('First image')).toHaveAttribute(
      'srcset',
      '/image-one.jpg?w=248&fit=crop&auto=format&dpr=2 2x',
    )
    expect(screen.getByAltText('Second image')).toHaveAttribute('loading', 'lazy')
  })
})
