/**
 * Manufacturer Dashboard
 *
 * Dashboard for manufacturers to view and co-sign pending attestations.
 * Manufacturers connect their wallet to see attestations awaiting their signature.
 */

import { ManufacturerDashboardClient } from './manufacturer-dashboard-client';

export default function ManufacturerDashboardPage() {
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manufacturer Dashboard</h1>
        <p className="text-gray-600">
          Connect your registered wallet to view and co-sign pending attestations
          for your guitar models.
        </p>
      </div>

      {/* Client-side dashboard */}
      <ManufacturerDashboardClient />
    </div>
  );
}

