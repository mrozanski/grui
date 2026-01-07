import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, getSignificanceColor, getConditionColor } from '@/lib/guitar-utils'
import Image from 'next/image'
import jessicaData from '../../../../doc/jessica.json'
import {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineTime,
  TimelineHeading,
  TimelineDescription,
} from '@/components/ui/timeline'

export default async function InstrumentPreview() {
  const { manufacturer, model, individual_guitar } = jessicaData
  const title = `${manufacturer.display_name} ${model.name} (${model.year})`
  const subtitle = `"${individual_guitar.nickname}" S/N ${individual_guitar.serial_number}`
  const imagePath = '/images/guitars/jessica.jpg'

  // Helper for spec rows - consistent 2-column layout
  const SpecRow = ({ label, value, mono = false }: { label: string, value: string | number, mono?: boolean }) => (
    <div className="flex items-baseline">
      <span className="w-[140px] shrink-0 text-right pr-6 text-sm text-muted-foreground/60">
        {label}
      </span>
      <span className={`text-sm text-foreground ${mono ? 'font-mono' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  )

  // Helper for section headers - styled with background strip
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-muted/30 py-1.5 px-2 -mx-2 mb-3 mt-8 first:mt-0">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-only Photo at Top */}
      <div className="block md:hidden px-4 pt-8">
        <Card>
          <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden">
            <Image
              src={imagePath}
              alt={`${title} - ${subtitle}`}
              fill
              className="object-cover"
              priority
            />
          </div>
        </Card>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-12">

          {/* Left Column: Main Content */}
          <div className="space-y-10">
            
            {/* Title Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-light text-foreground font-title">
                  {title}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {subtitle}
                </p>
              </div>

              <div>
                <Badge className={getSignificanceColor(individual_guitar.significance_level)}>
                  {individual_guitar.significance_level}
                </Badge>
              </div>
            </div>

            {/* Instrument Details Section - Reordered */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold font-title">Instrument Details</h2>

              <div className="max-w-2xl space-y-8">
                {/* 1. Significance */}
                {individual_guitar.significance_notes && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">Significance</h3>
                    <p className="text-base leading-relaxed text-foreground">
                      {individual_guitar.significance_notes}
                    </p>
                  </div>
                )}

                {/* 2. Provenance */}
                {individual_guitar.provenance_notes && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">Provenance</h3>
                    <p className="text-base leading-relaxed text-foreground">
                      {individual_guitar.provenance_notes}
                    </p>
                  </div>
                )}

                {/* 3. Modifications */}
                {individual_guitar.modifications && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">Modifications</h3>
                    <p className="text-base leading-relaxed text-foreground">
                      {individual_guitar.modifications}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications Section */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold font-title mb-6">Specifications</h2>

              {/* Constrained width container for specs */}
              <div className="max-w-[550px]">
                
                {/* Group 1: Wood & Construction */}
                <div>
                  <SectionHeader title="Wood & Construction" />
                  <div className="space-y-1.5">
                    {individual_guitar.specifications.body_wood && (
                      <SpecRow label="Body Wood" value={individual_guitar.specifications.body_wood} />
                    )}
                    {individual_guitar.specifications.neck_wood && (
                      <SpecRow label="Neck Wood" value={individual_guitar.specifications.neck_wood} />
                    )}
                    {individual_guitar.specifications.fingerboard_wood && (
                      <SpecRow label="Fingerboard" value={individual_guitar.specifications.fingerboard_wood} />
                    )}
                  </div>
                </div>

                {/* Group 2: Dimensions */}
                <div className="border-t border-border/40 mt-6 pt-2">
                  <SectionHeader title="Dimensions" />
                  <div className="space-y-1.5">
                    {individual_guitar.specifications.scale_length_inches && (
                      <SpecRow 
                        label="Scale Length" 
                        value={`${individual_guitar.specifications.scale_length_inches}"`} 
                        mono 
                      />
                    )}
                    {individual_guitar.specifications.num_frets && (
                      <SpecRow label="Frets" value={individual_guitar.specifications.num_frets} />
                    )}
                    {individual_guitar.specifications.weight_lbs && (
                      <SpecRow 
                        label="Weight" 
                        value={`${individual_guitar.specifications.weight_lbs} lbs`} 
                        mono 
                      />
                    )}
                  </div>
                </div>

                {/* Group 3: Electronics */}
                <div className="border-t border-border/40 mt-6 pt-2">
                  <SectionHeader title="Electronics" />
                  <div className="space-y-1.5">
                    {individual_guitar.specifications.pickup_configuration && (
                      <SpecRow label="Pickups" value={individual_guitar.specifications.pickup_configuration} />
                    )}
                    {individual_guitar.specifications.electronics_description && (
                      <SpecRow label="Controls" value={individual_guitar.specifications.electronics_description} />
                    )}
                  </div>
                </div>

                {/* Group 4: Hardware & Finish */}
                <div className="border-t border-border/40 mt-6 pt-2">
                  <SectionHeader title="Hardware & Finish" />
                  <div className="space-y-1.5">
                    {individual_guitar.specifications.bridge_type && (
                      <SpecRow label="Bridge" value={individual_guitar.specifications.bridge_type} />
                    )}
                    {individual_guitar.specifications.hardware_finish && (
                      <SpecRow label="Hardware" value={individual_guitar.specifications.hardware_finish} />
                    )}
                    {individual_guitar.specifications.body_finish && (
                      <SpecRow label="Finish" value={individual_guitar.specifications.body_finish} />
                    )}
                    {individual_guitar.specifications.neck_profile && (
                      <SpecRow label="Neck Profile" value={individual_guitar.specifications.neck_profile} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Provenance Timeline */}
            <div className="space-y-6 pt-4">
              <h2 className="text-2xl font-semibold font-title">Provenance Timeline</h2>
              <Timeline>
                {[
                  {
                    date: "1988-03-15",
                    title: "Manufacture",
                    description: "Completed at Gibson’s Nashville factory. Final QC inspection passed and instrument logged under serial 8 0005."
                  },
                  {
                    date: "1988-06-10",
                    title: "Artist Allocation",
                    description: "Presented to Slash by Gibson Artist Relations. Delivered as part of an endorsement package before the Use Your Illusion recording cycle."
                  },
                  {
                    date: "1991-08-01",
                    title: "Recording Session",
                    description: "Primary studio guitar for Use Your Illusion tour rehearsals. Extensive use in pre‑production sessions and early tour dates."
                  },
                  {
                    date: "1992-05-20",
                    title: "Repair",
                    description: "Headstock break professionally repaired. Neck fracture sustained during transport; repaired with splines and overspray by a major LA repair shop."
                  },
                  {
                    date: "2003-11-05",
                    title: "Modification",
                    description: "Electronics and hardware update. Original pickups replaced with higher‑output humbuckers; tuners and bridge swapped to current touring spec."
                  },
                  {
                    date: "2016-07-14",
                    title: "Exhibition",
                    description: "Displayed at a rock memorabilia showcase in Los Angeles. Loaned for a limited exhibition highlighting iconic instruments from Slash’s career."
                  },
                  {
                    date: "2024-09-30",
                    title: "Inspection & Attestation",
                    description: "Condition and provenance documented by third‑party expert. Comprehensive inspection, photo set, and valuation; digital attestation issued and linked to Jessica’s registry entry."
                  }
                ].map((event, index) => (
                  <TimelineItem key={index}>
                    <TimelineDot />
                    <TimelineTime>
                      {new Date(event.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </TimelineTime>
                    <TimelineHeading>{event.title}</TimelineHeading>
                    <TimelineDescription>
                      {event.description}
                    </TimelineDescription>
                  </TimelineItem>
                ))}
              </Timeline>
            </div>

          </div>

          {/* Right Column: Sticky Rail */}
          <div className="md:sticky md:top-8 md:self-start space-y-0">
            {/* Image Rail Background */}
            <div className="bg-muted/10 -mx-4 px-4 py-6 rounded-lg space-y-6">
              
              {/* Desktop-only Photo */}
              <div className="hidden md:block relative aspect-[4/3] w-full rounded overflow-hidden shadow-none">
                <Image
                  src={imagePath}
                  alt={`${title} - ${subtitle}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Summary Card */}
              <Card className="border-border/40 shadow-sm">
                <div className="bg-muted/30 py-3 px-6 border-b border-border/40">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Summary
                  </h3>
                </div>
                <CardContent className="space-y-6 pt-6">

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

                  {/* Verification */}
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Verification</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Verified</Badge>
                    </div>
                  </div>

                  {/* Attestations */}
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Attestations</div>
                    <div className="text-lg font-semibold">10</div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-border/40">
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
    </div>
  )
}
