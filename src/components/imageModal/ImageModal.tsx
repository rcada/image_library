import MuiModal from '@mui/material/Modal'
import MuiTypography from '@mui/material/Typography'
import './image-modal.css'

export interface ImageModalProps {
  open: boolean
  onClose: () => void
  imgSource?: string
  title?: string
  subtitle?: string
}

export default function ImageModal(props: ImageModalProps) {
  const { open, onClose, imgSource, title, subtitle } = props

  return (
    <MuiModal open={open} onClose={onClose}>
      <div className="image-modal">
        {imgSource && <img className="image-modal_image" src={imgSource} alt={title} />}

        {(title || subtitle) && (
          <div className="image-modal_metadata">
            {title && (
              <MuiTypography variant="h6" component="h2">
                {title}
              </MuiTypography>
            )}

            {subtitle && (
              <MuiTypography variant="body2" color="text.secondary">
                {subtitle}
              </MuiTypography>
            )}
          </div>
        )}
      </div>
    </MuiModal>
  )
}
