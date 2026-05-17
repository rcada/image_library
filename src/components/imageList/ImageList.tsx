import MuiImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import Skeleton from '@mui/material/Skeleton'

/**
 * Props for rendering an image grid or its loading placeholder state.
 */
export interface ImageListProps {
  /** Images to render in the grid. */
  itemData: { imgSource: string; title?: string; subtitle?: string }[]
  /** Whether to show skeleton placeholders instead of image items. */
  loading?: boolean
}

const SKELETON_ITEMS_COUNT = 10

/**
 * Displays a fixed-size image grid with optional loading placeholders.
 */
export default function ImageList({ itemData, loading = false }: ImageListProps) {
  return (
    <MuiImageList sx={{ width: 500, height: 450 }}>
      {loading
        ? Array.from({ length: SKELETON_ITEMS_COUNT }, (_, index) => (
            <ImageListItem key={index}>
              <Skeleton variant="rectangular" height={248} />
              <Skeleton variant="text" />
              <Skeleton variant="text" width="60%" />
            </ImageListItem>
          ))
        : itemData.map((item) => (
            <ImageListItem key={item.imgSource}>
              <img
                srcSet={`${item.imgSource}?w=248&fit=crop&auto=format&dpr=2 2x`}
                src={`${item.imgSource}?w=248&fit=crop&auto=format`}
                alt={item.title}
                loading="lazy"
              />
              <ImageListItemBar title={item.title} subtitle={item.subtitle} position="below" />
            </ImageListItem>
          ))}
    </MuiImageList>
  )
}
