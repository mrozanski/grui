import Image from 'next/image'
import { cn } from '@/lib/utils'

interface YouTubeEmbedProps {
  videoId?: string
  imageSrc: string
  imageAlt: string
  caption?: string
  className?: string
}

export function YouTubeEmbed({ 
  videoId, 
  imageSrc, 
  imageAlt,
  caption,
  className 
}: YouTubeEmbedProps) {
  return (
    <div className={cn("flex gap-4 items-start", className)}>
      <div className="relative aspect-video w-1/2 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
        />
      </div>
      {caption && (
        <div className="flex-1 text-left">
          <p className="text-sm text-muted-foreground italic">
            {caption}
          </p>
        </div>
      )}
    </div>
  )
}
