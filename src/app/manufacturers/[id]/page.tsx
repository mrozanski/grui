import ManufacturerDetail from './manufacturer-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ManufacturerDetailPage({ params }: Props) {
  return <ManufacturerDetail params={params} />
}