import MuiModal from '@mui/material/Modal'
import MuiTypography from '@mui/material/Typography'
import './image-modal.css'
import type { JSX } from 'react'

export interface ImageModalProps {
  open: boolean
  onClose: () => void
  imgSource?: string
  title?: string
  renderAiDescription?: (imgSource: string) => JSX.Element
}

export default function ImageModal(props: ImageModalProps) {
  const { open, onClose, imgSource, title, renderAiDescription } = props

  return (
    <MuiModal open={open} onClose={onClose}>
      <div className="image-modal">
        {imgSource && <img className="image-modal_image" src={imgSource} alt={title} />}

        <div className="image-modal_metadata">
          {title && (
            <MuiTypography variant="h6" component="h2">
              {title}
            </MuiTypography>
          )}

          {imgSource && renderAiDescription?.(imgSource)}
        </div>
      </div>
    </MuiModal>
  )
}
