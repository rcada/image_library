import MuiImageList from '@mui/material/ImageList'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
import Skeleton from '@mui/material/Skeleton'
import { useState, type JSX } from 'react'
import './image-list.css'

/**
 * Props for rendering an image grid or its loading placeholder state.
 */
export interface ImageListProps {
  /** Images to render in the grid. */
  itemData: ImageListItemData[]
  /** Whether to show skeleton placeholders instead of image items. */
  loading?: boolean
}

type ImageListItemData = {
  imgSource: string
  title?: string
  subtitle?: string
}

const SKELETON_ITEMS_COUNT = 10

const DEFAULT_IMAGE_SIZE = 250

const DEAFULT_IMAGE_LIST_WIDTH = 700

/**
 * Displays a fixed-size image grid with optional loading placeholders.
 */
export default function ImageList({ itemData, loading = false }: ImageListProps) {
  const renderImageSkeleton = () => <Skeleton variant="rectangular" height={DEFAULT_IMAGE_SIZE} />

  const renderLoadingImageListItem = (index: number) => (
    <ImageListItem key={index}>
      {renderImageSkeleton()}
      <Skeleton variant="text" />
      <Skeleton variant="text" width="60%" />
    </ImageListItem>
  )

  const renderImageListItem = (item: ImageListItemData) => (
    <ImageListItem key={item.imgSource}>
      <ImageWithSkeleton
        alt={item.title}
        renderImageSkeleton={renderImageSkeleton}
        src={item.imgSource}
      />
      <ImageListItemBar title={item.title} subtitle={item.subtitle} position="below" />
    </ImageListItem>
  )

  return (
    <MuiImageList sx={{ width: DEAFULT_IMAGE_LIST_WIDTH }}>
      {loading
        ? Array.from({ length: SKELETON_ITEMS_COUNT }, (_, index) =>
            renderLoadingImageListItem(index),
          )
        : itemData.map(renderImageListItem)}
    </MuiImageList>
  )
}

interface ImageWithSkeletonProps {
  alt?: string
  src: string
  renderImageSkeleton: () => JSX.Element
}

function ImageWithSkeleton(props: ImageWithSkeletonProps) {
  const { alt, src, renderImageSkeleton } = props
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="image-with-skeleton_container">
      {!loaded && renderImageSkeleton()}

      <img
        src={`${src}?w=${DEFAULT_IMAGE_SIZE}&fit=crop&auto=format`}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`image-with-skeleton_image ${loaded ? 'loaded' : 'hidden'}`}
      />
    </div>
  )
}
