import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export interface ImportRow {
  data: Record<string, string>;
  isValid: boolean;
  errors: string[];
}

interface ImportPreviewTableProps {
  columns: string[];
  rows: ImportRow[];
  maxPreview?: number;
}

export function ImportPreviewTable({ 
  columns, 
  rows, 
  maxPreview = 10 
}: ImportPreviewTableProps) {
  const previewRows = rows.slice(0, maxPreview);
  const validCount = rows.filter(r => r.isValid).length;
  const invalidCount = rows.length - validCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="gap-1">
          <CheckCircle className="h-3 w-3 text-primary" />
          {validCount} válidos
        </Badge>
        {invalidCount > 0 && (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {invalidCount} com erros
          </Badge>
        )}
        <span className="text-sm text-muted-foreground">
          Mostrando {previewRows.length} de {rows.length} registros
        </span>
      </div>

      <div className="border rounded-lg overflow-auto max-h-96">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Status</TableHead>
              {columns.map((col) => (
                <TableHead key={col} className="min-w-32">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewRows.map((row, idx) => (
              <TableRow key={idx} className={!row.isValid ? "bg-destructive/5" : ""}>
                <TableCell>
                  {row.isValid ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <div className="relative group">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <div className="absolute left-6 top-0 hidden group-hover:block z-10 bg-popover border rounded p-2 text-xs max-w-64 shadow-lg">
                        {row.errors.join(", ")}
                      </div>
                    </div>
                  )}
                </TableCell>
                {columns.map((col) => (
                  <TableCell key={col} className="text-sm">
                    {row.data[col] || "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
