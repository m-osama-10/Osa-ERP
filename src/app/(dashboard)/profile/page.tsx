'use client'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { User } from 'lucide-react'
export default function ProfilePage() {
  const { lang, user } = useApp()
  return (
    <Card className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="grid h-20 w-20 place-items-center rounded-2xl gradient-primary text-white text-2xl font-bold">{user?.name?.charAt(0) || 'م'}</div>
        <div>
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-muted-foreground">{user?.email}</p>
          <p className="text-sm text-primary font-semibold mt-1">{user?.role}</p>
        </div>
      </div>
    </Card>
  )
}
