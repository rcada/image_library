import type { ChangeEventHandler, ReactNode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import ApiKeySettings from '../../../src/components/apiKeySettings/ApiKeySettings'

type PropsWithChildren = {
  children?: ReactNode
  [key: string]: unknown
}

type TextFieldProps = {
  fullWidth?: boolean
  label: string
  type: string
  value: string
  onChange: ChangeEventHandler<HTMLInputElement>
}

type ButtonProps = PropsWithChildren & {
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const mockMuiTextField = jest.fn((props: TextFieldProps) => (
  <label>
    {props.label}
    <input
      aria-label={props.label}
      data-full-width={props.fullWidth}
      type={props.type}
      value={props.value}
      onChange={props.onChange}
    />
  </label>
))

const mockMuiButton = jest.fn(({ children, disabled, type }: ButtonProps) => (
  <button disabled={disabled} type={type}>
    {children}
  </button>
))

jest.mock('@mui/material/TextField', () => ({
  __esModule: true,
  default: (props: TextFieldProps) => mockMuiTextField(props),
}))

jest.mock('@mui/material/Button', () => ({
  __esModule: true,
  default: (props: ButtonProps) => mockMuiButton(props),
}))

describe('ApiKeySettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the password text field and save button with provided labels', () => {
    render(
      <ApiKeySettings
        textFieldLabel="OpenAI API key"
        buttonLabel="Save key"
        onApiKeySave={jest.fn()}
      />,
    )

    const textField = screen.getByLabelText('OpenAI API key')

    expect(textField).toBeInTheDocument()
    expect(textField).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Save key' })).toBeInTheDocument()
  })

  it('disables the save button while the API key field is empty', () => {
    render(
      <ApiKeySettings
        textFieldLabel="OpenAI API key"
        buttonLabel="Save key"
        onApiKeySave={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Save key' })).toBeDisabled()
  })

  it('calls onApiKeySave with the entered API key when the button is clicked', () => {
    const onApiKeySave = jest.fn()

    render(
      <ApiKeySettings
        textFieldLabel="OpenAI API key"
        buttonLabel="Save key"
        onApiKeySave={onApiKeySave}
      />,
    )

    fireEvent.change(screen.getByLabelText('OpenAI API key'), {
      target: { value: 'sk-test-key' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save key' }))

    expect(onApiKeySave).toHaveBeenCalledTimes(1)
    expect(onApiKeySave).toHaveBeenCalledWith('sk-test-key')
  })

  it('disables the save button after saving until the API key changes', () => {
    const onApiKeySave = jest.fn()

    render(
      <ApiKeySettings
        textFieldLabel="OpenAI API key"
        buttonLabel="Save key"
        onApiKeySave={onApiKeySave}
      />,
    )

    const textField = screen.getByLabelText('OpenAI API key')
    const saveButton = screen.getByRole('button', { name: 'Save key' })

    fireEvent.change(textField, {
      target: { value: 'sk-test-key' },
    })
    expect(saveButton).toBeEnabled()

    fireEvent.click(saveButton)
    expect(saveButton).toBeDisabled()

    fireEvent.change(textField, {
      target: { value: 'sk-updated-key' },
    })
    expect(saveButton).toBeEnabled()
  })
})
