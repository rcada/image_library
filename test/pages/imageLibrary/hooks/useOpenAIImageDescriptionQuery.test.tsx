import type { PropsWithChildren } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useOpenAIImageDescriptionQuery } from '../../../../src/pages/imageLibrary/hooks/useOpenAIImageDescriptionQuery'

const mockResponsesCreate = jest.fn()
const mockOpenAIOptions: unknown[] = []

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((options) => {
    mockOpenAIOptions.push(options)

    return {
      responses: {
        create: mockResponsesCreate,
      },
    }
  }),
}))

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

describe('useOpenAIImageDescriptionQuery', () => {
  beforeEach(() => {
    mockResponsesCreate.mockReset()
    mockOpenAIOptions.length = 0
  })

  it('returns a query for getting OpenAI image descriptions', () => {
    const { result } = renderHook(() => useOpenAIImageDescriptionQuery(null, '/image-one.jpg'), {
      wrapper: createWrapper(),
    })

    expect(result.current.isPending).toBe(true)
    expect(result.current.refetch).toEqual(expect.any(Function))
  })

  it('sends the provided image source to OpenAI and trims the description', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: '  A quiet mountain lake at sunrise.  ',
    })

    const { result } = renderHook(
      () => useOpenAIImageDescriptionQuery('sk-test-key', 'https://picsum.photos/id/1/1200/800'),
      {
        wrapper: createWrapper(),
      },
    )

    await waitFor(() => expect(result.current.data).toBe('A quiet mountain lake at sunrise.'))

    expect(mockOpenAIOptions).toEqual([
      {
        apiKey: 'sk-test-key',
        dangerouslyAllowBrowser: true,
      },
    ])
    expect(mockResponsesCreate).toHaveBeenCalledWith({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Describe this image in one brief sentence.',
            },
            {
              type: 'input_image',
              detail: 'auto',
              image_url: 'https://picsum.photos/id/1/1200/800',
            },
          ],
        },
      ],
    })
  })

  it('reuses the cached description for repeated calls with the same image source', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: 'A single cached description.',
    })

    const { result, rerender } = renderHook(
      ({ imageSource }) => useOpenAIImageDescriptionQuery('sk-test-key', imageSource),
      {
        initialProps: { imageSource: '/image-one.jpg' },
        wrapper: createWrapper(),
      },
    )

    await waitFor(() => expect(result.current.data).toBe('A single cached description.'))

    rerender({ imageSource: '/image-one.jpg' })

    await waitFor(() => expect(result.current.data).toBe('A single cached description.'))
    expect(mockResponsesCreate).toHaveBeenCalledTimes(1)
  })

  it('fetches a new description for a different image source', async () => {
    mockResponsesCreate
      .mockResolvedValueOnce({
        output_text: 'First image description.',
      })
      .mockResolvedValueOnce({
        output_text: 'Second image description.',
      })

    const { result, rerender } = renderHook(
      ({ imageSource }) => useOpenAIImageDescriptionQuery('sk-test-key', imageSource),
      {
        initialProps: { imageSource: '/image-one.jpg' },
        wrapper: createWrapper(),
      },
    )

    await waitFor(() => expect(result.current.data).toBe('First image description.'))

    rerender({ imageSource: '/image-two.jpg' })

    await waitFor(() => expect(result.current.data).toBe('Second image description.'))
    expect(mockResponsesCreate).toHaveBeenCalledTimes(2)
  })

  it('does not fetch when no OpenAI API key is available', () => {
    const { result } = renderHook(() => useOpenAIImageDescriptionQuery(null, '/image-one.jpg'), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockResponsesCreate).not.toHaveBeenCalled()
  })

  it('does not fetch when no image source is available', () => {
    const { result } = renderHook(() => useOpenAIImageDescriptionQuery('sk-test-key', ''), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockResponsesCreate).not.toHaveBeenCalled()
  })

  it('throws when OpenAI returns an empty description', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: '   ',
    })

    const { result } = renderHook(
      () => useOpenAIImageDescriptionQuery('sk-test-key', '/image-one.jpg'),
      {
        wrapper: createWrapper(),
      },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(new Error('OpenAI did not return an image description'))
  })

  it('uses the provided API key', async () => {
    mockResponsesCreate.mockResolvedValue({
      output_text: 'A fresh description.',
    })

    const { result } = renderHook(
      () => useOpenAIImageDescriptionQuery('sk-original-key', '/image-one.jpg'),
      {
        wrapper: createWrapper(),
      },
    )

    await waitFor(() => expect(result.current.data).toBe('A fresh description.'))

    await waitFor(() =>
      expect(mockOpenAIOptions).toContainEqual({
        apiKey: 'sk-original-key',
        dangerouslyAllowBrowser: true,
      }),
    )
  })
})
