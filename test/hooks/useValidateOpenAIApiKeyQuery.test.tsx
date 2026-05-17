import { act, renderHook, waitFor } from '@testing-library/react'
import { useValidateOpenAIApiKeyQuery } from '../../src/hooks/useValidateOpenAIApiKeyQuery'

const mockModelsList = jest.fn()
const mockOpenAIOptions: unknown[] = []

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((options) => {
    mockOpenAIOptions.push(options)

    return {
      models: {
        list: mockModelsList,
      },
    }
  }),
}))

describe('useValidateOpenAIApiKeyQuery', () => {
  beforeEach(() => {
    mockModelsList.mockReset()
    mockOpenAIOptions.length = 0
  })

  it('returns success when OpenAI accepts the API key', async () => {
    mockModelsList.mockResolvedValue({})

    const { result } = renderHook(() => useValidateOpenAIApiKeyQuery())

    let validationResult: boolean | undefined

    await act(async () => {
      validationResult = await result.current.validate('sk-valid-key')
    })

    expect(result.current).toEqual({
      validate: expect.any(Function),
      stage: 'SUCCESS',
    })
    expect(validationResult).toBe(true)

    expect(mockOpenAIOptions).toEqual([
      {
        apiKey: 'sk-valid-key',
        dangerouslyAllowBrowser: true,
      },
    ])
    expect(mockModelsList).toHaveBeenCalledTimes(1)
  })

  it('returns error when OpenAI rejects the API key', async () => {
    mockModelsList.mockRejectedValue(new Error('Unauthorized'))

    const { result } = renderHook(() => useValidateOpenAIApiKeyQuery())

    let validationResult: boolean | undefined

    await act(async () => {
      validationResult = await result.current.validate('sk-invalid-key')
    })

    expect(result.current).toEqual({
      validate: expect.any(Function),
      stage: 'ERROR',
    })
    expect(validationResult).toBe(false)
  })

  it('validates manually with the latest provided API key', async () => {
    mockModelsList.mockResolvedValue({})

    const { result } = renderHook(() => useValidateOpenAIApiKeyQuery())

    await act(async () => {
      await result.current.validate('sk-original-key')
    })

    await act(async () => {
      await result.current.validate('sk-updated-key')
    })

    expect(mockOpenAIOptions).toEqual([
      {
        apiKey: 'sk-original-key',
        dangerouslyAllowBrowser: true,
      },
      {
        apiKey: 'sk-updated-key',
        dangerouslyAllowBrowser: true,
      },
    ])
    expect(mockModelsList).toHaveBeenCalledTimes(2)
  })

  it('returns error without calling OpenAI when no API key is available', async () => {
    const { result } = renderHook(() => useValidateOpenAIApiKeyQuery())

    let validationResult: boolean | undefined

    await act(async () => {
      validationResult = await result.current.validate(null)
    })

    expect(result.current).toEqual({
      validate: expect.any(Function),
      stage: 'ERROR',
    })
    expect(validationResult).toBe(false)
    expect(mockModelsList).not.toHaveBeenCalled()
    expect(mockOpenAIOptions).toEqual([])
  })

  it('sets loading state while validation is pending', async () => {
    let resolveValidation = () => {}
    mockModelsList.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveValidation = resolve
        }),
    )

    const { result } = renderHook(() => useValidateOpenAIApiKeyQuery())

    act(() => {
      void result.current.validate('sk-valid-key')
    })

    await waitFor(() =>
      expect(result.current).toEqual({
        validate: expect.any(Function),
        stage: 'LOADING',
      }),
    )

    await act(async () => {
      resolveValidation()
    })

    expect(result.current).toEqual({
      validate: expect.any(Function),
      stage: 'SUCCESS',
    })
  })

  it('returns not ran yet before validation starts', () => {
    mockModelsList.mockResolvedValue({})

    const { result } = renderHook(() => useValidateOpenAIApiKeyQuery())

    expect(result.current).toEqual({
      validate: expect.any(Function),
      stage: 'NOT_RAN_YET',
    })
  })

  it('only exposes the manual validation action and validation stage', () => {
    mockModelsList.mockResolvedValue({})

    const { result } = renderHook(() => useValidateOpenAIApiKeyQuery())

    expect(Object.keys(result.current)).toEqual(['validate', 'stage'])
  })
})
