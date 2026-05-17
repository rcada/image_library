import { type ChangeEvent, useState } from 'react'
import MuiPagination from '@mui/material/Pagination'
import ImageList, { type ImageListItemData } from '../../components/imageList/ImageList'
import ImageModal from '../../components/imageModal/ImageModal'
import { type PicsumImage, usePicsumImagesQuery } from './hooks/usePicsumImagesQuery'
import './image-library-page.css'

const INITIAL_PAGE = 1

export default function ImageLibraryPage() {
  const { data: images = [], getImagesPage } = usePicsumImagesQuery()
  const [page, setPage] = useState(INITIAL_PAGE)
  const [pageImages, setPageImages] = useState<PicsumImage[]>()
  const [selectedImage, setSelectedImage] = useState<ImageListItemData>()

  const handlePageChange = async (_event: ChangeEvent<unknown>, nextPage: number) => {
    setPage(nextPage)
    setPageImages(await getImagesPage(nextPage))
  }

  const itemData = (pageImages ?? images).map((image) => ({
    imgSource: image.download_url,
    title: image.author,
  }))
  const renderPagination = () => (
    <MuiPagination count={10} onChange={handlePageChange} page={page} />
  )

  return (
    <div className="image-library-page">
      {renderPagination()}
      <ImageList itemData={itemData} onImageClick={setSelectedImage} />
      <ImageModal
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(undefined)}
        {...selectedImage}
      />
      {renderPagination()}
    </div>
  )
}
