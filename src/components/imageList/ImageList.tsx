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
  itemData: { imgSource: string; title?: string; subtitle?: string }[]
  /** Whether to show skeleton placeholders instead of image items. */
  loading?: boolean
}

const SKELETON_ITEMS_COUNT = 10

const DEFAULT_IMAGE_SIZE = 250

const DEAFULT_IMAGE_LIST_WIDTH = 700

/**
 * Displays a fixed-size image grid with optional loading placeholders.
 */
export default function ImageList({ itemData, loading = false }: ImageListProps) {
  const imageSkeleton = <Skeleton variant="rectangular" height={DEFAULT_IMAGE_SIZE} />
  return (
    <MuiImageList sx={{ width: DEAFULT_IMAGE_LIST_WIDTH }}>
      {loading
        ? Array.from({ length: SKELETON_ITEMS_COUNT }, (_, index) => (
            <ImageListItem key={index}>
              {imageSkeleton}
              <Skeleton variant="text" />
              <Skeleton variant="text" width="60%" />
            </ImageListItem>
          ))
        : itemData.map((item) => (
            <ImageListItem key={item.imgSource}>
              <ImageWithSkeleton
                alt={item.title}
                imageSkeleton={imageSkeleton}
                src={item.imgSource}
              />
              <ImageListItemBar title={item.title} subtitle={item.subtitle} position="below" />
            </ImageListItem>
          ))}
    </MuiImageList>
  )
}

interface ImageWithSkeletonProps {
  alt?: string
  src: string
  imageSkeleton: JSX.Element
}

function ImageWithSkeleton(props: ImageWithSkeletonProps) {
  const { alt, src, imageSkeleton } = props
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="image-with-skeleton_container">
      {!loaded && imageSkeleton}

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
