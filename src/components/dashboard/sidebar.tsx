'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Car,
  Users,
  Contact,
  AlertTriangle,
  CreditCard,
  KeyRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/carreras', label: 'Carreras', icon: Car },
  { href: '/conductores', label: 'Conductores', icon: Contact },
  { href: '/usuarios', label: 'Usuarios', icon: Users },
  { href: '/incidentes', label: 'Incidentes', icon: AlertTriangle },
  { href: '/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/ajustes/api-keys', label: 'API Keys', icon: KeyRound },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-white md:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="text-2xl">🚕</span>
        <div className="leading-tight">
          <p className="font-bold text-gray-900">TaxiBot</p>
          <p className="text-xs text-gray-500">Panel PMA</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4 text-xs text-gray-400">TaxiBot CRM v2.0</div>
    </aside>
  )
}
