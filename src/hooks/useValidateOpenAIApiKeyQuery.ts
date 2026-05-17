import { useCallback, useState } from 'react'
import OpenAI from 'openai'

export type ValidateOpenAIApiKeyStage = 'SUCCESS' | 'NOT_RAN_YET' | 'ERROR' | 'LOADING'

const validateOpenAIApiKey = async (apiKey: string | null): Promise<true> => {
  if (!apiKey) {
    throw new Error('OpenAI API key is required')
  }

  const client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  })

  await client.models.list()

  return true
}

/**
 * Checks whether an OpenAI API key can authenticate against OpenAI.
 */
export const useValidateOpenAIApiKeyQuery = () => {
  const [stage, setStage] = useState<ValidateOpenAIApiKeyStage>('NOT_RAN_YET')

  const validate = useCallback(async (apiKey: string | null): Promise<boolean> => {
    setStage('LOADING')

    try {
      await validateOpenAIApiKey(apiKey)
      setStage('SUCCESS')
      return true
    } catch {
      setStage('ERROR')
      return false
    }
  }, [])

  return { validate, stage }
}
