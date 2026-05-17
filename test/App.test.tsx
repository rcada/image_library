import type { FormEvent, ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../src/App'

const mockSetApiKey = jest.fn()
const mockValidate = jest.fn()
const mockApiKeySettings = jest.fn((props: ApiKeySettingsMockProps) => (
  <form
    data-error={props.error}
    data-success={props.success}
    onSubmit={(event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const formData = new FormData(event.currentTarget)
      void props.onApiKeySave(String(formData.get('apiKey')))
    }}
  >
    <label>
      {props.textFieldLabel}
      <input aria-label={props.textFieldLabel} name="apiKey" />
    </label>
    <button type="submit">{props.buttonLabel}</button>
  </form>
))
let mockStage = 'NOT_RAN_YET'

type ApiKeySettingsMockProps = {
  buttonLabel: string
  error: boolean
  success: boolean
  textFieldLabel: string
  onApiKeySave: (apiKey: string) => boolean | void | Promise<boolean | void>
}

jest.mock('../src/pages/imageLibrary/ImageLibraryPage', () => ({
  __esModule: true,
  default: () => <div data-testid="image-library-page" />,
}))

jest.mock('../src/components/apiKeySettings/ApiKeySettings', () => ({
  __esModule: true,
  default: (props: ApiKeySettingsMockProps) => mockApiKeySettings(props),
}))

jest.mock('../src/context/ApiKeyContext', () => ({
  ApiKeyProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useApiKey: () => ({
    setApiKey: mockSetApiKey,
  }),
}))

jest.mock('../src/hooks/useValidateOpenAIApiKeyQuery', () => ({
  useValidateOpenAIApiKeyQuery: () => ({
    stage: mockStage,
    validate: mockValidate,
  }),
}))

describe('App', () => {
  beforeEach(() => {
    mockApiKeySettings.mockClear()
    mockSetApiKey.mockReset()
    mockValidate.mockReset()
    mockStage = 'NOT_RAN_YET'
  })

  it('renders the image library page', () => {
    render(<App />)

    expect(screen.getByTestId('image-library-page')).toBeInTheDocument()
  })

  it('saves the API key after validation succeeds', async () => {
    mockValidate.mockResolvedValue(true)

    render(<App />)

    fireEvent.change(screen.getByLabelText('OpenAI Api Key'), {
      target: { value: 'sk-valid-key' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockValidate).toHaveBeenCalledWith('sk-valid-key'))
    expect(mockSetApiKey).toHaveBeenCalledTimes(1)
    expect(mockSetApiKey).toHaveBeenCalledWith('sk-valid-key')
  })

  it('does not save the API key when validation fails', async () => {
    mockValidate.mockResolvedValue(false)

    render(<App />)

    fireEvent.change(screen.getByLabelText('OpenAI Api Key'), {
      target: { value: 'sk-invalid-key' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockValidate).toHaveBeenCalledWith('sk-invalid-key'))
    expect(mockSetApiKey).not.toHaveBeenCalled()
  })

  it('passes validation status to the API key settings', () => {
    mockStage = 'ERROR'
    const { rerender } = render(<App />)

    expect(mockApiKeySettings).toHaveBeenLastCalledWith(
      expect.objectContaining({
        error: true,
        success: false,
      }),
    )

    mockStage = 'SUCCESS'
    rerender(<App />)

    expect(mockApiKeySettings).toHaveBeenLastCalledWith(
      expect.objectContaining({
        error: false,
        success: true,
      }),
    )
  })
})
