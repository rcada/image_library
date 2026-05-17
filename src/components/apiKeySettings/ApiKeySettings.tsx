import MuiButton from '@mui/material/Button'
import MuiTextField from '@mui/material/TextField'
import { type SubmitEvent, useState } from 'react'
import './api-key-settings.css'

export interface ApiKeySettingsProps {
  textFieldLabel: string
  buttonLabel: string
  onApiKeySave: (apiKey: string) => void
}

export default function ApiKeySettings(props: ApiKeySettingsProps) {
  const { textFieldLabel, buttonLabel, onApiKeySave } = props
  const [apiKey, setApiKey] = useState('')
  const [savedApiKey, setSavedApiKey] = useState('')

  const saveButtonDisabled = !apiKey || apiKey === savedApiKey

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    if (saveButtonDisabled) {
      return
    }

    onApiKeySave(apiKey)
    setSavedApiKey(apiKey)
  }

  return (
    <form className="api-key-settings" onSubmit={handleSubmit}>
      <MuiTextField
        fullWidth
        label={textFieldLabel}
        type="password"
        value={apiKey}
        onChange={(event) => setApiKey(event.target.value)}
      />
      <MuiButton disabled={saveButtonDisabled} type="submit" variant="contained">
        {buttonLabel}
      </MuiButton>
    </form>
  )
}
