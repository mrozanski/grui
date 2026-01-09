import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import gretschData from '../../../../mock-data/gretsch_g5420t.json'
import {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineTime,
  TimelineHeading,
  TimelineDescription,
} from '@/components/ui/timeline'
import { YouTubeEmbed } from '@/components/ui/youtube-embed'
import { ExternalLink } from 'lucide-react'
import { getProductionTypeColor } from '@/lib/guitar-utils'

export default async function ModelPreview() {
  const { model } = gretschData
  const title = model.name
  const subtitle = 'Electromatic Classic Hollowbody Electric Guitar'
  const imagePath = '/images/guitars/gretsch_g5420t.jpg'

  // Helper for spec rows - consistent 2-column layout
  const SpecRow = ({ label, value, mono = false }: { label: string, value: string | number, mono?: boolean }) => (
    <div className="flex items-baseline">
      <span className="w-[140px] shrink-0 text-right pr-6 text-sm text-muted-foreground/60 font-title">
        {label}
      </span>
      <span className={`text-sm text-foreground ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )

  // Helper for section headers - styled with background strip
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-muted/30 py-1.5 px-2 -mx-2 mb-3 mt-8 first:mt-0">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-title">
        {title}
      </h3>
    </div>
  )

  // Timeline events - ordered oldest to newest
  const timelineEvents = [
    {
      date: '2012-01-01',
      type: 'Manufacturer Announcement',
      title: 'Gretsch Announces G5420T Electromatic Classic',
      content: {
        type: 'paragraph',
        text: 'Gretsch introduces the G5420T Electromatic Classic Hollow Body as part of the Electromatic Series, bringing traditional Gretsch hollowbody design, Filter\'Tron pickups, and Bigsby vibrato to a more accessible price point.',
        link: {
          label: 'Official Product Announcement',
          url: 'https://www.gretschguitars.com/gear/build/hollow-body/g5420t-electromatic-classic-hollow-body-single-cut-with-bigsby/2506115547',
        },
      },
    },
    {
      date: '2019-03-01',
      type: 'Historical Interpretation',
      title: 'Electromatic Series and Hollowbody Heritage',
      content: {
        type: 'narrative',
        text: 'The Electromatic series draws heavily from Gretsch\'s classic hollowbody lineage, adapting the look, feel, and tonal character of vintage models like the 6120 for modern manufacturing and broader accessibility.',
        video: {
          imageSrc: '/images/guitars/gretsch-history.png',
          imageAlt: 'Historical overview video',
          caption: 'Example historical overview. Embedded for demonstration purposes.',
        },
      },
    },
    {
      date: '2020-06-01',
      type: 'Technical Analysis',
      title: 'Construction & Electronics Breakdown',
      content: {
        type: 'technical',
        bullets: [
          'Laminated maple hollowbody with trestle bracing',
          'Set maple neck with Classic "C" profile',
          'FT-5E Filter\'Tron humbuckers',
          'Bigsby B60 vibrato and Adjusto-Matic bridge',
        ],
        video: {
          imageSrc: '/images/guitars/gretsch-tech.png',
          imageAlt: 'Technical breakdown video',
        },
      },
    },
    {
      date: '2024-04-01',
      type: 'Review',
      title: 'Demonstration & Review 10 Years Later',
      content: {
        type: 'review',
        attribution: 'Review by Example Creator',
        video: {
          imageSrc: '/images/guitars/gretsch-review.png',
          imageAlt: 'Review video demonstration',
        },
        excerpt: 'A hands-on review covering tone, playability, and long-term impressions of the G5420T in real-world use.',
        affiliate: {
          label: 'Purchase Option',
          linkText: 'Buy Gretsch G5420T at Sweetwater',
          url: 'https://www.sweetwater.com/store/detail/G5420TECHSWS--gretsch-g5420t-electromatic-classic-hollowbody-single-cut-electric-guitar-with-bigsby-walnut-stain',
          disclosure: 'Example affiliate link for demonstration purposes.',
        },
      },
    },
    {
      date: '2024-08-01',
      type: 'Usage Interpretation',
      title: 'Gretsch G5420T Featured in Rig Rundown',
      content: {
        type: 'usage',
        text: 'The G5420T appears as part of a full performance rig, illustrating how the model integrates with amplifiers, pedals, and genre-specific setups in a live or studio environment.',
        video: {
          imageSrc: '/images/guitars/gretsch-rig.png',
          imageAlt: 'Rig rundown video',
        },
      },
    },
  ]

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
                <h1 className="text-4xl font-light text-foreground font-title leading-[1.2]">
                  {title}
                </h1>
                <p className="text-lg font-light text-muted-foreground font-title">
                  {subtitle}
                </p>
              </div>

              <div>
                <Badge className={getProductionTypeColor(model.production_type)}>
                  {model.production_type}
                </Badge>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="space-y-2 pt-2">
              <h2 className="text-2xl font-semibold font-title mt-10 mb-6">Specifications</h2>

              {/* Constrained width container for specs */}
              <div className="max-w-[550px]">
                
                {/* Group 1: Wood & Construction */}
                <div>
                  <SectionHeader title="Wood & Construction" />
                  <div className="space-y-1.5">
                    {model.specifications.body_wood && (
                      <SpecRow label="Body Wood" value={model.specifications.body_wood} />
                    )}
                    {model.specifications.neck_wood && (
                      <SpecRow label="Neck Wood" value={model.specifications.neck_wood} />
                    )}
                    {model.specifications.fingerboard_wood && (
                      <SpecRow label="Fingerboard" value={model.specifications.fingerboard_wood} />
                    )}
                  </div>
                </div>

                {/* Group 2: Dimensions */}
                <div className="border-t border-border/40 mt-6 pt-2">
                  <SectionHeader title="Dimensions" />
                  <div className="space-y-1.5">
                    {model.specifications.scale_length_inches && (
                      <SpecRow 
                        label="Scale Length" 
                        value={`${model.specifications.scale_length_inches}"`} 
                        mono 
                      />
                    )}
                    {model.specifications.num_frets && (
                      <SpecRow label="Frets" value={model.specifications.num_frets} />
                    )}
                    {model.specifications.nut_width_inches && (
                      <SpecRow 
                        label="Nut Width" 
                        value={`${model.specifications.nut_width_inches}"`} 
                        mono 
                      />
                    )}
                  </div>
                </div>

                {/* Group 3: Electronics */}
                <div className="border-t border-border/40 mt-6 pt-2">
                  <SectionHeader title="Electronics" />
                  <div className="space-y-1.5">
                    {model.specifications.pickup_configuration && (
                      <SpecRow label="Pickups" value={model.specifications.pickup_configuration} />
                    )}
                    {model.specifications.electronics_description && (
                      <SpecRow label="Controls" value={model.specifications.electronics_description} />
                    )}
                  </div>
                </div>

                {/* Group 4: Hardware & Finish */}
                <div className="border-t border-border/40 mt-6 pt-2">
                  <SectionHeader title="Hardware & Finish" />
                  <div className="space-y-1.5">
                    {model.specifications.bridge_type && (
                      <SpecRow label="Bridge" value={model.specifications.bridge_type} />
                    )}
                    {model.specifications.hardware_finish && (
                      <SpecRow label="Hardware" value={model.specifications.hardware_finish} />
                    )}
                    {model.specifications.body_finish && (
                      <SpecRow label="Finish" value={model.specifications.body_finish} />
                    )}
                    {model.specifications.neck_profile && (
                      <SpecRow label="Neck Profile" value={model.specifications.neck_profile} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Model History Timeline */}
            <div className="space-y-6 pt-4">
              <h2 className="text-2xl font-semibold font-title mt-10 mb-6">Model History</h2>
              <Timeline className="space-y-12">
                {timelineEvents.map((event, index) => (
                  <TimelineItem key={index}>
                    <TimelineDot />
                    <TimelineTime className="font-mono text-xs text-muted-foreground/70 mb-2">
                      {new Date(event.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </TimelineTime>
                    <div className="mb-1">
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <TimelineHeading className="font-title text-xl font-medium mb-3 text-foreground">
                      {event.title}
                    </TimelineHeading>
                    
                    {/* Event Content Blocks */}
                    {event.content && (
                      <div className="space-y-4 mt-4">
                        {/* Event 1: Manufacturer Announcement */}
                        {event.content.type === 'paragraph' && (
                          <>
                            <TimelineDescription className="text-[17px] leading-[1.6] text-foreground">
                              {event.content.text}
                            </TimelineDescription>
                            {event.content.link && (
                              <div className="pt-2">
                                <a
                                  href={event.content.link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline inline-flex items-center gap-1.5 text-sm"
                                >
                                  <span>{event.content.link.label}</span>
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            )}
                          </>
                        )}

                        {/* Event 2: Historical Interpretation */}
                        {event.content.type === 'narrative' && (
                          <>
                            <TimelineDescription className="text-[17px] leading-[1.6] text-foreground">
                              {event.content.text}
                            </TimelineDescription>
                            {event.content.video && (
                              <div className="mt-4">
                                <YouTubeEmbed
                                  imageSrc={event.content.video.imageSrc}
                                  imageAlt={event.content.video.imageAlt}
                                  caption={event.content.video.caption}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {/* Event 3: Technical Analysis */}
                        {event.content.type === 'technical' && (
                          <>
                            <ul className="list-disc list-inside space-y-1.5 text-[17px] leading-[1.6] text-foreground pl-1">
                              {event.content.bullets?.map((bullet, bulletIndex) => (
                                <li key={bulletIndex}>{bullet}</li>
                              ))}
                            </ul>
                            {event.content.video && (
                              <div className="mt-4">
                                <YouTubeEmbed
                                  imageSrc={event.content.video.imageSrc}
                                  imageAlt={event.content.video.imageAlt}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {/* Event 4: Review */}
                        {event.content.type === 'review' && (
                          <>
                            {event.content.attribution && (
                              <p className="text-sm text-muted-foreground font-title -mt-2 mb-3">
                                {event.content.attribution}
                              </p>
                            )}
                            {event.content.video && (
                              <div className="mt-2 mb-4">
                                <YouTubeEmbed
                                  imageSrc={event.content.video.imageSrc}
                                  imageAlt={event.content.video.imageAlt}
                                />
                              </div>
                            )}
                            {event.content.excerpt && (
                              <TimelineDescription className="text-[17px] leading-[1.6] text-foreground">
                                {event.content.excerpt}
                              </TimelineDescription>
                            )}
                            {event.content.affiliate && (
                              <Card className="mt-4 border-border/40 bg-muted/20">
                                <CardContent className="pt-6">
                                  <div className="space-y-3">
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-title">
                                      {event.content.affiliate.label}
                                    </div>
                                    <a
                                      href={event.content.affiliate.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline inline-flex items-center gap-1.5 text-sm"
                                    >
                                      <span>{event.content.affiliate.linkText}</span>
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                    <p className="text-xs text-muted-foreground pt-1">
                                      {event.content.affiliate.disclosure}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </>
                        )}

                        {/* Event 5: Usage Interpretation */}
                        {event.content.type === 'usage' && (
                          <>
                            <TimelineDescription className="text-[17px] leading-[1.6] text-foreground">
                              {event.content.text}
                            </TimelineDescription>
                            {event.content.video && (
                              <div className="mt-4">
                                <YouTubeEmbed
                                  imageSrc={event.content.video.imageSrc}
                                  imageAlt={event.content.video.imageAlt}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
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
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider font-title">
                    Summary
                  </h3>
                </div>
                <CardContent className="space-y-6 pt-6">

                  {/* MSRP */}
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground font-title">MSRP</div>
                    <div className="text-3xl font-bold text-foreground flex items-baseline">
                      <span className="text-2xl mr-0.5">$</span>
                      <span className="font-mono">{model.msrp_original.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Verification */}
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground font-title">Verification</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="font-mono text-xs">Verified</Badge>
                    </div>
                  </div>

                  {/* Attestations */}
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground font-title">Attestations</div>
                    <div className="text-lg font-semibold font-mono">5</div>
                  </div>

                  {/* CTA */}
                  <div className="pt-4 border-t border-border/40">
                    <Button className="w-full" size="lg">
                      View Model History
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
