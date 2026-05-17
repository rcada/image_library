import MuiTypography from '@mui/material/Typography'
import ImageLibraryPage from './pages/imageLibrary/ImageLibraryPage'
import ApiKeySettings from './components/apiKeySettings/ApiKeySettings'
import { ApiKeyProvider, useApiKey } from './context/ApiKeyContext'
import { useValidateOpenAIApiKeyQuery } from './hooks/useValidateOpenAIApiKeyQuery'

function AppContent() {
  const { setApiKey } = useApiKey()
  const { validate, stage } = useValidateOpenAIApiKeyQuery()

  const handleApiKeySave = async (apiKey: string) => {
    const isValid = await validate(apiKey)

    if (isValid) {
      setApiKey(apiKey)
    }

    return isValid
  }

  return (
    <main className="app">
      <section className="intro">
        <MuiTypography variant="h3">Image Library</MuiTypography>
        <MuiTypography variant="subtitle1">
          A simple image library project that fetches images from picsum photos and displays them
          using Material UI components. If you want to access picture description, provide an OpenAI
          API key.
        </MuiTypography>
        <ApiKeySettings
          buttonLabel="Save"
          error={stage === 'ERROR'}
          success={stage === 'SUCCESS'}
          textFieldLabel="OpenAI Api Key"
          onApiKeySave={handleApiKeySave}
        />
        <ImageLibraryPage />
      </section>
    </main>
  )
}

function App() {
  return (
    <ApiKeyProvider>
      <AppContent />
    </ApiKeyProvider>
  )
}

export default App
