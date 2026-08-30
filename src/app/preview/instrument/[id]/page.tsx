import InstrumentPreview from './instrument-preview'

interface InstrumentPreviewPageProps {
  params: Promise<{ id: string }>
}

export default async function InstrumentPreviewPage({ params }: InstrumentPreviewPageProps) {
  return <InstrumentPreview params={params} />
}
