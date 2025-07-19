import GuitarDetail from './guitar-detail'

interface GuitarDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function GuitarDetailPage({ params }: GuitarDetailPageProps) {
  return <GuitarDetail params={params} />
}