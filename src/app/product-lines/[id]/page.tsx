import ProductLineDetail from './product-line-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductLineDetailPage({ params }: Props) {
  return <ProductLineDetail params={params} />
}