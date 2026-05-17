import MuiButton from '@mui/material/Button'
import MuiTextField from '@mui/material/TextField'
import { type SubmitEvent, useState } from 'react'
import './api-key-settings.css'

export interface ApiKeySettingsProps {
  textFieldLabel: string
  buttonLabel: string
  error: boolean
  success: boolean
  onApiKeySave: (apiKey: string) => boolean | void | Promise<boolean | void>
}

export default function ApiKeySettings(props: ApiKeySettingsProps) {
  const { textFieldLabel, buttonLabel, error, success, onApiKeySave } = props
  const [apiKey, setApiKey] = useState('')
  const [savedApiKey, setSavedApiKey] = useState('')

  const saveButtonDisabled = !apiKey || apiKey === savedApiKey

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault()
    if (saveButtonDisabled) {
      return
    }

    const isSaved = await onApiKeySave(apiKey)
    if (isSaved !== false) {
      setSavedApiKey(apiKey)
    }
  }

  return (
    <form className="api-key-settings" onSubmit={handleSubmit}>
      <MuiTextField
        fullWidth
        label={textFieldLabel}
        type="password"
        value={apiKey}
        onChange={(event) => setApiKey(event.target.value)}
        error={error}
        color={success ? 'success' : 'primary'}
      />
      <MuiButton disabled={saveButtonDisabled} type="submit" variant="contained">
        {buttonLabel}
      </MuiButton>
    </form>
  )
}
