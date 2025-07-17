import ModelDetail from './model-detail'

interface ModelDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ModelDetailPage({ params }: ModelDetailPageProps) {
  return <ModelDetail params={params} />
}