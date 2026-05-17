import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { usePicsumImagesQuery } from '../../../../src/pages/imageLibrary/hooks/usePicsumImagesQuery'

const mockFetch = jest.fn()

globalThis.fetch = mockFetch

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const createImagesResponse = (ok: boolean, data: unknown = []) => ({
  ok,
  json: jest.fn().mockResolvedValue(data),
})

describe('usePicsumImagesQuery', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('fetches the first Picsum image page with the default limit', async () => {
    const images = [
      {
        id: '1',
        author: 'Alejandro Escamilla',
        width: 5616,
        height: 3744,
        url: 'https://unsplash.com/photos/yC-Yzbqy7PY',
        download_url: 'https://picsum.photos/id/1/5616/3744',
      },
    ]
    mockFetch.mockResolvedValue(createImagesResponse(true, images))

    const { result } = renderHook(() => usePicsumImagesQuery(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.data).toEqual(images))

    expect(mockFetch).toHaveBeenCalledWith('https://picsum.photos/v2/list?page=1&limit=10')
  })

  it('fetches a requested page with a custom limit', async () => {
    const images = [
      {
        id: '11',
        author: 'Paul Jarvis',
        width: 2500,
        height: 1667,
        url: 'https://unsplash.com/photos/6J--NXulQCs',
        download_url: 'https://picsum.photos/id/11/2500/1667',
      },
    ]
    mockFetch
      .mockResolvedValueOnce(createImagesResponse(true, []))
      .mockResolvedValueOnce(createImagesResponse(true, images))

    const { result } = renderHook(() => usePicsumImagesQuery(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    await expect(result.current.getImagesPage(3, 5)).resolves.toEqual(images)
    expect(mockFetch).toHaveBeenLastCalledWith('https://picsum.photos/v2/list?page=3&limit=5')
  })

  it('throws when Picsum responds with an error', async () => {
    mockFetch.mockResolvedValue(createImagesResponse(false))

    const { result } = renderHook(() => usePicsumImagesQuery(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(new Error('Failed to fetch images'))
  })
})
