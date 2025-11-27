/**
 * Admin: Manufacturer Wallet Registration Page
 *
 * Allows admins to register and manage manufacturer wallet addresses.
 */

import { prisma } from '@/lib/prisma';
import { getManufacturerWallets } from '@/lib/data/manufacturer-wallets';
import { WalletRegistrationForm } from './wallet-registration-form';
import { WalletList } from './wallet-list';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ManufacturerWalletsPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch manufacturer
  const manufacturer = await prisma.manufacturers.findUnique({
    where: { id },
  });

  if (!manufacturer) {
    notFound();
  }

  // Fetch registered wallets
  const wallets = await getManufacturerWallets(id);

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm mb-6">
        <ol className="flex items-center gap-2 text-gray-500">
          <li>
            <Link href="/manufacturers" className="hover:text-gray-700">
              Manufacturers
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              href={`/manufacturers/${id}`}
              className="hover:text-gray-700"
            >
              {manufacturer.name}
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">Wallet Management</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wallet Management</h1>
        <p className="text-gray-600">
          Manage wallet addresses for{' '}
          <span className="font-semibold">{manufacturer.name}</span>. Registered
          wallets can co-sign attestations for this manufacturer&apos;s guitar models.
        </p>
      </div>

      {/* Registration Form */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Register New Wallet</h2>
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <WalletRegistrationForm
            manufacturerId={id}
            manufacturerName={manufacturer.name}
          />
        </div>
      </section>

      {/* Registered Wallets */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Registered Wallets ({wallets.length})
        </h2>
        <WalletList wallets={wallets} manufacturerId={id} />
      </section>
    </div>
  );
}

