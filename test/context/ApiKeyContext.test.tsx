import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiKeyProvider, useApiKey } from '../../src/context/ApiKeyContext'

function ApiKeyConsumer() {
  const { apiKey, setApiKey } = useApiKey()

  return (
    <>
      <p>Saved API key: {apiKey}</p>
      <button type="button" onClick={() => setApiKey('sk-test-key')}>
        Save key
      </button>
    </>
  )
}

describe('ApiKeyContext', () => {
  it('makes the saved API key available to provider children', async () => {
    const user = userEvent.setup()

    render(
      <ApiKeyProvider>
        <ApiKeyConsumer />
      </ApiKeyProvider>,
    )

    expect(screen.getByText('Saved API key:')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save key' }))

    expect(screen.getByText('Saved API key: sk-test-key')).toBeInTheDocument()
  })
})
