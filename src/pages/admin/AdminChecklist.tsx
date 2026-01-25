import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';

export default function AdminChecklist() {
  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Checklist</h1>
            <p className="text-muted-foreground">Gerenciamento de checklists</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Em construção...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Vamos desenhar juntos o conteúdo desta página.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
