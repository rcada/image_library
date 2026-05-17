import MuiTypography from '@mui/material/Typography'
import ImageLibraryPage from './pages/imageLibrary/ImageLibraryPage'

function App() {
  return (
    <main className="app">
      <section className="intro" aria-labelledby="project-title">
        <MuiTypography variant="h3">Image Library</MuiTypography>
        <MuiTypography variant="subtitle1" gutterBottom>
          A simple image library project that fetches images from picsum photos and displays them
          using Material UI components
        </MuiTypography>
        <ImageLibraryPage />
      </section>
    </main>
  )
}

export default App
