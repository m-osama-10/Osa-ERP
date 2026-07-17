'use client'
import { useApp } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Bell } from 'lucide-react'
export default function NotificationsPage() {
  const { lang } = useApp()
  return (
    <Card className="p-8 text-center">
      <Bell className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
      <h2 className="text-xl font-bold mb-2">{lang === 'ar' ? 'مركز الإشعارات' : 'Notification Center'}</h2>
      <p className="text-muted-foreground">{lang === 'ar' ? 'جميع الإشعارات تظهر في شريط الأدوات العلوي' : 'All notifications appear in the top bar'}</p>
    </Card>
  )
}
