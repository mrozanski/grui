import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, getSignificanceColor, getConditionColor } from '@/lib/guitar-utils'
import Image from 'next/image'
import jessicaData from '../../../../doc/jessica.json'

export default async function InstrumentPreview() {
  const { manufacturer, model, individual_guitar } = jessicaData
  const title = `${manufacturer.display_name} ${model.name} (${model.year})`
  const subtitle = `"${individual_guitar.nickname}" S/N ${individual_guitar.serial_number}`
  const imagePath = '/images/guitars/jessica.jpg'

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Band - Full Width */}
      <div className="w-full bg-background border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

            {/* Left: Title + Subtitle */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-light text-foreground font-title">
                  {title}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {subtitle}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                <Badge className={getSignificanceColor(individual_guitar.significance_level)}>
                  {individual_guitar.significance_level}
                </Badge>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden">
              <Image
                src={imagePath}
                alt={`${title} - ${subtitle}`}
                fill
                className="object-cover"
                priority
              />
            </div>

          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

          {/* Left Column: Main Content (scrollable) */}
          <div className="space-y-8">

            {/* Instrument Details Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold font-title">Instrument Details</h2>

              {/* Significance Notes */}
              {individual_guitar.significance_notes && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Significance</h3>
                  <p className="text-base leading-relaxed text-foreground">
                    {individual_guitar.significance_notes}
                  </p>
                </div>
              )}

              {/* Modifications */}
              {individual_guitar.modifications && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Modifications</h3>
                  <p className="text-base leading-relaxed text-foreground">
                    {individual_guitar.modifications}
                  </p>
                </div>
              )}

              {/* Provenance Notes */}
              {individual_guitar.provenance_notes && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Provenance</h3>
                  <p className="text-base leading-relaxed text-foreground">
                    {individual_guitar.provenance_notes}
                  </p>
                </div>
              )}
            </div>

            {/* Specifications Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold font-title">Specifications</h2>

              {/* Group 1: Wood & Construction */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Wood & Construction
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {individual_guitar.specifications.body_wood && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Body Wood</span>
                      <span className="text-sm font-medium">{individual_guitar.specifications.body_wood}</span>
                    </div>
                  )}
                  {individual_guitar.specifications.neck_wood && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Neck Wood</span>
                      <span className="text-sm font-medium">{individual_guitar.specifications.neck_wood}</span>
                    </div>
                  )}
                  {individual_guitar.specifications.fingerboard_wood && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Fingerboard</span>
                      <span className="text-sm font-medium">{individual_guitar.specifications.fingerboard_wood}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Group 2: Dimensions */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Dimensions
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {individual_guitar.specifications.scale_length_inches && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Scale Length</span>
                      <span className="text-sm font-medium font-mono">
                        {individual_guitar.specifications.scale_length_inches}"
                      </span>
                    </div>
                  )}
                  {individual_guitar.specifications.num_frets && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Frets</span>
                      <span className="text-sm font-medium">{individual_guitar.specifications.num_frets}</span>
                    </div>
                  )}
                  {individual_guitar.specifications.weight_lbs && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Weight</span>
                      <span className="text-sm font-medium font-mono">
                        {individual_guitar.specifications.weight_lbs} lbs
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Group 3: Electronics */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Electronics
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {individual_guitar.specifications.pickup_configuration && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Pickups</span>
                      <span className="text-sm font-medium">{individual_guitar.specifications.pickup_configuration}</span>
                    </div>
                  )}
                  {individual_guitar.specifications.electronics_description && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Controls</span>
                      <span className="text-sm font-medium">{individual_guitar.specifications.electronics_description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Group 4: Hardware & Finish */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Hardware & Finish
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {individual_guitar.specifications.bridge_type && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Bridge</span>
                      <span className="text-sm font-medium">{individual_guitar.specifications.bridge_type}</span>
                    </div>
                  )}
                  {individual_guitar.specifications.hardware_finish && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Hardware</span>
                      <span className="text-sm font-medium">{individual_guitar.specifications.hardware_finish}</span>
                    </div>
                  )}
                  {individual_guitar.specifications.body_finish && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Finish</span>
                      <span className="text-sm font-medium">{individual_guitar.specifications.body_finish}</span>
                    </div>
                  )}
                  {individual_guitar.specifications.neck_profile && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-sm text-muted-foreground">Neck Profile</span>
                      <span className="text-sm font-medium">{individual_guitar.specifications.neck_profile}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Provenance Timeline Placeholder */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold font-title">Provenance Timeline</h2>

              {/* Phase 1.2 Placeholder */}
              <div className="p-8 border-2 border-dashed border-border rounded-lg bg-muted/20">
                <p className="text-center text-muted-foreground">
                  Timeline component will be added in Phase 1.2 using HyperUI vertical timeline
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Summary Rail */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-title">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Estimated Value */}
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Estimated Value</div>
                  <div className="text-3xl font-bold text-foreground">
                    {formatCurrency(individual_guitar.current_estimated_value)}
                  </div>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Condition</div>
                  <Badge className={getConditionColor(individual_guitar.condition_rating)}>
                    {individual_guitar.condition_rating}
                  </Badge>
                </div>

                {/* Verification Status - Static for Phase 1.1 */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Verification</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Verified</Badge>
                  </div>
                </div>

                {/* Attestation Count - Static placeholder */}
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Attestations</div>
                  <div className="text-lg font-semibold">10</div>
                </div>

                {/* CTA Button */}
                <div className="pt-4 border-t border-border">
                  <Button className="w-full" size="lg">
                    View Provenance
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
