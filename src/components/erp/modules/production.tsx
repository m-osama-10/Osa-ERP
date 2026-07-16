'use client'

import * as React from 'react'
import { useApp, t } from '@/components/erp/app-context'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Factory, Plus, FlaskConical, ClipboardList, Boxes } from 'lucide-react'

export function Production() {
  const { lang } = useApp()

  const boms = [
    { product: 'لابتوب ديل مجمع', components: 8, totalCost: 2650, status: 'نشط' },
    { product: 'كرسي مكتبي مجمّع', components: 5, totalCost: 280, status: 'نشط' },
  ]

  const productionOrders = [
    { order: 'PO-001', product: 'لابتوب ديل مجمع', qty: 50, status: 'مكتمل', date: '2024-01-15', cost: 132500 },
    { order: 'PO-002', product: 'كرسي مكتبي مجمّع', qty: 100, status: 'قيد التنفيذ', date: '2024-02-20', cost: 28000 },
    { order: 'PO-003', product: 'لابتوب ديل مجمع', qty: 30, status: 'مخطط', date: '2024-03-10', cost: 79500 },
  ]

  return (
    <div className="space-y-6 animate-in-fade">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"><Factory className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'أوامر الإنتاج' : 'Orders'}</p><p className="text-xl font-bold">{productionOrders.length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600"><Boxes className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الوصفات' : 'BOMs'}</p><p className="text-xl font-bold">{boms.length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600"><ClipboardList className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</p><p className="text-xl font-bold">{productionOrders.filter(o => o.status === 'قيد التنفيذ').length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600"><FlaskConical className="h-5 w-5" /></div>
            <div><p className="text-xs text-muted-foreground">{lang === 'ar' ? 'إجمالي التكلفة' : 'Total Cost'}</p><p className="text-xl font-bold">240,000</p></div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{lang === 'ar' ? 'أوامر الإنتاج' : 'Production Orders'}</h3>
          <Button><Plus className="h-4 w-4 ml-1" />{lang === 'ar' ? 'أمر جديد' : 'New Order'}</Button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'رقم' : 'No'}</th>
                <th className="px-4 py-3 text-start">{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                <th className="px-4 py-3 text-end">{lang === 'ar' ? 'الكمية' : 'Qty'}</th>
                <th className="px-4 py-3 text-start">{t(lang, 'date')}</th>
                <th className="px-4 py-3 text-end">{lang === 'ar' ? 'التكلفة' : 'Cost'}</th>
                <th className="px-4 py-3 text-center">{t(lang, 'status')}</th>
              </tr>
            </thead>
            <tbody>
              {productionOrders.map(o => (
                <tr key={o.order} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{o.order}</td>
                  <td className="px-4 py-3 font-medium">{o.product}</td>
                  <td className="px-4 py-3 text-end">{o.qty}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                  <td className="px-4 py-3 text-end font-semibold">{new Intl.NumberFormat('ar-EG').format(o.cost)} ج.م</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={o.status === 'مكتمل' ? 'default' : o.status === 'قيد التنفيذ' ? 'secondary' : 'outline'}>{o.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">{lang === 'ar' ? 'وصفات التصنيع (BOM)' : 'Bill of Materials'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {boms.map((b, i) => (
            <div key={i} className="rounded-xl border-2 border-border p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"><Boxes className="h-5 w-5" /></div>
                  <div>
                    <p className="font-bold">{b.product}</p>
                    <p className="text-xs text-muted-foreground">{b.components} {lang === 'ar' ? 'مكونات' : 'components'}</p>
                  </div>
                </div>
                <Badge>{b.status}</Badge>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <p className="text-sm text-muted-foreground">{lang === 'ar' ? 'إجمالي التكلفة' : 'Total Cost'}</p>
                <p className="text-xl font-bold text-primary">{new Intl.NumberFormat('ar-EG').format(b.totalCost)} ج.م</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
