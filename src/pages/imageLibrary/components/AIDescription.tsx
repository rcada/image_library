import MuiTypography from '@mui/material/Typography'
import { useOpenAIImageDescriptionQuery } from '../hooks/useOpenAIImageDescriptionQuery'
import { useApiKey } from '../../../context/ApiKeyContext'
import { Skeleton } from '@mui/material'

interface AIDescriptionProps {
  imgSource: string
}

export default function AIDescription(props: AIDescriptionProps) {
  const { imgSource } = props
  const { apiKey } = useApiKey()
  const { data, isLoading } = useOpenAIImageDescriptionQuery(apiKey, imgSource)
  if (!apiKey) {
    return null
  }
  if (isLoading) {
    return <Skeleton variant="text" />
  }
  return <MuiTypography variant="body1">{data}</MuiTypography>
}
