import { useQuery, useQueryClient } from '@tanstack/react-query'

export type PicsumImage = {
  id: string
  author: string
  width: number
  height: number
  url: string
  download_url: string
}

const PICSUM_IMAGES_URL = 'https://picsum.photos/v2/list'
const INITIAL_PAGE = 1
const INITIAL_LIMIT = 10

const createImagesSearchParams = (page: number, limit: number) =>
  new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

const getImagesQueryKey = (searchParams: URLSearchParams) => ['images', searchParams.toString()]

const getImages = async (searchParams: URLSearchParams): Promise<PicsumImage[]> => {
  const response = await fetch(`${PICSUM_IMAGES_URL}?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch images')
  }

  return response.json()
}

/**
 * Fetches the initial Picsum image page and exposes a helper for loading additional pages.
 *
 * @returns React Query state for the initial page, plus `getImagesPage` for fetching a specific page.
 */
export const usePicsumImagesQuery = () => {
  const queryClient = useQueryClient()
  const searchParams = createImagesSearchParams(INITIAL_PAGE, INITIAL_LIMIT)

  const getImagesPage = (page: number, limit = INITIAL_LIMIT) => {
    const pageSearchParams = createImagesSearchParams(page, limit)

    return queryClient.fetchQuery({
      queryKey: getImagesQueryKey(pageSearchParams),
      queryFn: () => getImages(pageSearchParams),
    })
  }

  const query = useQuery({
    queryKey: getImagesQueryKey(searchParams),
    queryFn: () => getImages(searchParams),
  })

  return {
    ...query,
    getImagesPage,
  }
}
