import MuiTypography from '@mui/material/Typography'
import ImageLibraryPage from './pages/imageLibrary/ImageLibraryPage'
import ApiKeySettings from './components/apiKeySettings/ApiKeySettings'
import { ApiKeyProvider, useApiKey } from './context/ApiKeyContext'

function AppContent() {
  const { setApiKey } = useApiKey()

  return (
    <main className="app">
      <section className="intro" aria-labelledby="project-title">
        <MuiTypography variant="h3">Image Library</MuiTypography>
        <MuiTypography variant="subtitle1">
          A simple image library project that fetches images from picsum photos and displays them
          using Material UI components. If you want to access picture description, provide an OpenAI
          API key.
        </MuiTypography>
        <ApiKeySettings
          buttonLabel="Save"
          textFieldLabel="OpenAI Api Key"
          onApiKeySave={setApiKey}
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
