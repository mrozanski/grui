import { prisma } from '@/lib/prisma'

export default async function DBStatusPage() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Get some basic stats
    const modelCount = await prisma.models.count()
    const manufacturerCount = await prisma.manufacturers.count()
    const reviewCount = await prisma.expert_reviews.count()
    const associationCount = await prisma.review_model_associations.count()
    
    // Get a few sample models for testing
    const sampleModels = await prisma.models.findMany({
      take: 5,
      include: {
        manufacturers: true
      }
    })
    
    await prisma.$disconnect()
    
    return (
      <div className="container mx-auto py-8 space-y-6">
        <h1 className="text-3xl font-bold">Database Status</h1>
        
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h3 className="font-semibold text-green-800 mb-2">✅ Database Connection: SUCCESS</h3>
          <p className="text-green-700">Prisma is successfully connected to PostgreSQL</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="text-2xl font-bold text-blue-800">{modelCount}</div>
            <div className="text-sm text-blue-600">Models</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="text-2xl font-bold text-blue-800">{manufacturerCount}</div>
            <div className="text-sm text-blue-600">Manufacturers</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="text-2xl font-bold text-blue-800">{reviewCount}</div>
            <div className="text-sm text-blue-600">Expert Reviews</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="text-2xl font-bold text-blue-800">{associationCount}</div>
            <div className="text-sm text-blue-600">Review Associations</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Sample Models (for testing):</h2>
          <div className="grid gap-2">
                         {sampleModels.map(model => (
               <div key={model.id} className="bg-gray-50 border rounded p-3">
                 <div className="font-medium">{model.manufacturers?.name || 'Unknown'} {model.name} {model.year}</div>
                 <div className="text-sm text-gray-600">ID: {model.id}</div>
               </div>
             ))}
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Testing Instructions:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Use one of the model IDs above to test the CreateReviewModal</li>
            <li>• Visit <code>/test-db</code> to test database writes</li>
            <li>• Visit <code>/create-review-demo?open=true&modelId=MODEL_ID</code> to test the modal</li>
          </ul>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <h1 className="text-3xl font-bold">Database Status</h1>
        
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h3 className="font-semibold text-red-800 mb-2">❌ Database Connection: FAILED</h3>
          <p className="text-red-700 mb-2">Prisma could not connect to PostgreSQL</p>
          <pre className="text-sm bg-red-100 p-2 rounded overflow-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    )
  }
} 