'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Social {
  name: string
  href: string
  image: string
}

interface SocialLinksProps extends React.HTMLAttributes<HTMLDivElement> {
  socials: Social[]
}

export function SocialLinks({ socials, className, ...props }: SocialLinksProps) {
  const [hoveredSocial, setHoveredSocial] = React.useState<string | null>(null)

  return (
    <div
      className={cn('flex items-center gap-3', className)}
      role="list"
      aria-label="Social media links"
      {...props}
    >
      {socials.map((social) => (
        <motion.a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'relative flex items-center justify-center transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800',
            'rounded-full',
            hoveredSocial && hoveredSocial !== social.name
              ? 'opacity-50 scale-90'
              : 'opacity-100 scale-100'
          )}
          onMouseEnter={() => setHoveredSocial(social.name)}
          onMouseLeave={() => setHoveredSocial(null)}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          aria-label={`Visit our ${social.name} page`}
          role="listitem"
        >
          <img
            src={social.image}
            alt={`${social.name} icon`}
            className="h-8 w-8 object-contain"
            loading="lazy"
            decoding="async"
          />
        </motion.a>
      ))}
    </div>
  )
}
