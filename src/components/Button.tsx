import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

/* The one button on the site. Every call to action, form button and text link
   that looks like a button goes through here, so colour, radius, padding and
   icon spacing are decided once.

   - `to` renders a router link, so navigation is a real link: it can be opened
     in a new tab and search engines can follow it.
   - `href` renders a plain anchor, for downloads, tel:, mailto: and outside sites.
   - otherwise it is a <button>, defaulting to type="button" so it never submits
     a form by accident. */

export type ButtonVariant =
  | 'primary' // red: the main action on a screen
  | 'navy' // dark blue: final submit on long forms
  | 'secondary' // white with a navy outline, on light backgrounds
  | 'outline-light' // transparent with a white outline, on photos and navy bands
  | 'whatsapp' // green, for the WhatsApp link only
  | 'text' // red text with an icon, for "View details" style links
  | 'text-light' // pale text, for links on dark heroes

export type ButtonSize = 'sm' | 'md' | 'lg'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /* Lucide icon shown beside the label. */
  icon?: LucideIcon
  iconPosition?: 'start' | 'end'
  fullWidth?: boolean
  className?: string
  children?: ReactNode
}

type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    to?: undefined
    href?: undefined
  }
type AsRouterLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | 'href'> & {
    to: string
    href?: undefined
  }
type AsAnchor = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string
    to?: undefined
  }

export type ButtonProps = AsButton | AsRouterLink | AsAnchor

const iconSize: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 18 }

export default function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'end',
    fullWidth = false,
    className,
    children,
    ...rest
  } = props

  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const icon = Icon && (
    <Icon
      className={`btn-icon btn-icon-${iconPosition}`}
      size={iconSize[size]}
      strokeWidth={2.25}
      aria-hidden="true"
    />
  )
  const content = (
    <>
      {iconPosition === 'start' && icon}
      {children}
      {iconPosition === 'end' && icon}
    </>
  )

  if (rest.to !== undefined) {
    const { to, ...anchor } = rest as AsRouterLink
    return (
      <Link to={to} className={classes} {...anchor}>
        {content}
      </Link>
    )
  }
  if (rest.href !== undefined) {
    const anchor = rest as AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <a className={classes} {...anchor}>
        {content}
      </a>
    )
  }
  const { type = 'button', ...button } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button type={type} className={classes} {...button}>
      {content}
    </button>
  )
}
