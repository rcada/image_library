import { useQuery } from '@tanstack/react-query'
import OpenAI from 'openai'

const IMAGE_DESCRIPTION_MODEL = 'gpt-4.1-mini'
const SESSION_CACHE_TIME = Infinity // until the end of the session

const getOpenAIImageDescriptionQueryKey = (imageSource: string) => [
  'openai-image-description',
  imageSource,
]

const getOpenAIImageDescriptionFromOpenAI = async (
  apiKey: string | null,
  imageSource: string,
): Promise<string> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required to describe images')
  }

  const client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  })

  const response = await client.responses.create({
    model: IMAGE_DESCRIPTION_MODEL,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Describe this image in one brief sentence.',
          },
          {
            type: 'input_image',
            detail: 'auto',
            image_url: imageSource,
          },
        ],
      },
    ],
  })

  const description = response.output_text.trim()

  if (!description) {
    throw new Error('OpenAI did not return an image description')
  }

  return description
}

const createOpenAIImageDescriptionQueryOptions = (apiKey: string | null, imageSource: string) => ({
  queryKey: getOpenAIImageDescriptionQueryKey(imageSource),
  queryFn: () => getOpenAIImageDescriptionFromOpenAI(apiKey, imageSource),
  staleTime: SESSION_CACHE_TIME,
  gcTime: SESSION_CACHE_TIME,
  enabled: Boolean(apiKey && imageSource),
})

/**
 * Fetches a brief OpenAI description for an image URL.
 */
export const useOpenAIImageDescriptionQuery = (apiKey: string | null, imageSource: string) => {
  return useQuery(createOpenAIImageDescriptionQueryOptions(apiKey, imageSource))
}
