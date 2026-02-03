import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Car, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VeiculoCSV {
  client_id: string;
  marca: string;
  carro: string;
  modelo: string;
  year: string;
  color: string;
  plate: string;
  chassis: string;
  km: string;
  fuel_type: string;
  notes: string;
  versao: string;
  origem_contato: string;
}

export default function ImportarVeiculosAntigos() {
  const [file, setFile] = useState<File | null>(null);
  const [veiculos, setVeiculos] = useState<VeiculoCSV[]>([]);
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState({ total: 0, imported: 0, errors: 0 });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    const text = await selectedFile.text();
    const lines = text.split('\n');
    const headers = lines[0].split(';').map(h => h.trim().replace(/^\uFEFF/, ''));
    
    const parsed: VeiculoCSV[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(';');
      const record: Record<string, string> = {};
      
      headers.forEach((header, idx) => {
        record[header] = values[idx]?.trim() || '';
      });
      
      // Só importar se tiver placa
      if (record.plate) {
        parsed.push({
          client_id: record.client_id || '',
          marca: record.marca || '',
          carro: record.carro || '',
          modelo: record.modelo || '',
          year: record.year || '',
          color: record.color || '',
          plate: record.plate || '',
          chassis: record.chassis || '',
          km: record.km || '',
          fuel_type: record.fuel_type || '',
          notes: record.notes || '',
          versao: record.versao || '',
          origem_contato: record.origem_contato || '',
        });
      }
    }
    
    setVeiculos(parsed);
    setStats({ total: parsed.length, imported: 0, errors: 0 });
    toast.success(`${parsed.length} veículos encontrados no arquivo`);
  };

  const handleImport = async () => {
    if (veiculos.length === 0) {
      toast.error("Nenhum veículo para importar");
      return;
    }

    setImporting(true);
    let imported = 0;
    let errors = 0;

    // Processar em lotes de 100
    const batchSize = 100;
    for (let i = 0; i < veiculos.length; i += batchSize) {
      const batch = veiculos.slice(i, i + batchSize);
      
      const records = batch.map(v => ({
        client_id_original: v.client_id || null,
        marca: v.marca?.trim() || null,
        modelo: `${v.carro?.trim() || ''} ${v.modelo?.trim() || ''}`.trim() || null,
        versao: v.versao?.trim() || null,
        ano: v.year?.trim() || null,
        cor: v.color?.trim() || null,
        placa: v.plate?.trim().toUpperCase() || null,
        chassi: v.chassis?.trim() || null,
        km: v.km ? parseInt(v.km.replace(/\D/g, '')) || null : null,
        combustivel: v.fuel_type?.trim() || null,
        notas: v.notes?.trim() || null,
        origem_contato: v.origem_contato?.trim() || null,
        is_active: true,
      }));

      const { error } = await supabase
        .from('veiculos_orfaos')
        .insert(records);

      if (error) {
        console.error('Erro ao importar lote:', error);
        errors += batch.length;
      } else {
        imported += batch.length;
      }

      setStats({ total: veiculos.length, imported, errors });
    }

    setImporting(false);
    
    if (errors === 0) {
      toast.success(`${imported} veículos importados com sucesso!`);
    } else {
      toast.warning(`${imported} importados, ${errors} erros`);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Importar Veículos Antigos</h1>
          <p className="text-muted-foreground">
            Importe veículos do sistema antigo para a tabela de veículos órfãos
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total no Arquivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600">Importados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{stats.imported.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Erros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{stats.errors.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload do CSV
            </CardTitle>
            <CardDescription>
              Selecione o arquivo CSV com os veículos antigos (separador: ponto e vírgula)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : "Clique para selecionar o arquivo CSV"}
                </p>
              </label>
            </div>

            {veiculos.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    <span className="font-medium">{veiculos.length} veículos prontos para importar</span>
                  </div>
                  <Badge variant="outline">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Todos irão para "Veículos Órfãos"
                  </Badge>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="p-2">Placa</th>
                        <th className="p-2">Marca</th>
                        <th className="p-2">Modelo</th>
                        <th className="p-2">Ano</th>
                        <th className="p-2">Cor</th>
                        <th className="p-2">Client ID Original</th>
                      </tr>
                    </thead>
                    <tbody>
                      {veiculos.slice(0, 20).map((v, i) => (
                        <tr key={i} className="border-t border-border/50">
                          <td className="p-2 font-mono">{v.plate}</td>
                          <td className="p-2">{v.marca}</td>
                          <td className="p-2">{v.carro} {v.modelo}</td>
                          <td className="p-2">{v.year}</td>
                          <td className="p-2">{v.color || '-'}</td>
                          <td className="p-2">{v.client_id || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {veiculos.length > 20 && (
                    <p className="text-center text-muted-foreground text-xs mt-2">
                      ... e mais {veiculos.length - 20} veículos
                    </p>
                  )}
                </div>

                <Button 
                  onClick={handleImport} 
                  disabled={importing}
                  className="w-full"
                  size="lg"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando... ({stats.imported}/{stats.total})
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Importar {veiculos.length} Veículos
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
