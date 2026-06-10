import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'text-primary',
}: {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  accent?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn('rounded-lg bg-muted p-2.5', accent)}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
