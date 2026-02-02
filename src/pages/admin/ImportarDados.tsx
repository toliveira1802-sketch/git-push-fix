import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { FileUploadZone } from "@/components/import/FileUploadZone";
import { ImportPreviewTable } from "@/components/import/ImportPreviewTable";
import { useImportData } from "@/hooks/useImportData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Users, 
  Car, 
  Download, 
  Loader2, 
  CheckCircle,
  ArrowLeft 
} from "lucide-react";
import { useNavigate } from "@/hooks/useNavigate";

type ImportType = "clients" | "vehicles";

const TEMPLATES = {
  clients: [
    ["Nome", "Telefone", "Email", "CPF", "Endereco", "Cidade", "Origem", "Observacoes"],
    ["João Silva", "11999998888", "joao@email.com", "123.456.789-00", "Rua das Flores, 123", "São Paulo", "indicacao", "Cliente VIP"],
  ],
  vehicles: [
    ["Placa", "Marca", "Modelo", "Ano", "Cor", "KM", "Telefone_Cliente", "Chassi", "Combustivel"],
    ["ABC1234", "Toyota", "Corolla", "2020", "Branco", "45000", "11999998888", "", "flex"],
  ],
};

function downloadTemplate(type: ImportType) {
  const data = TEMPLATES[type];
  const csvContent = data.map(row => row.join(";")).join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `template_${type}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ImportarDados() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ImportType>("clients");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importComplete, setImportComplete] = useState(false);
  
  const { 
    isLoading, 
    parsedData, 
    columns, 
    parseFile, 
    executeImport, 
    reset, 
    validCount 
  } = useImportData();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setImportComplete(false);
    await parseFile(file, activeTab);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setImportComplete(false);
    reset();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as ImportType);
    handleClearFile();
  };

  const handleImport = async () => {
    const count = await executeImport();
    if (count > 0) {
      setImportComplete(true);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Importar Dados
            </h1>
            <p className="text-muted-foreground">
              Importe clientes e veículos via arquivo CSV ou Excel
            </p>
          </div>
        </div>

        {/* Success State */}
        {importComplete && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Importação Concluída!</h2>
              <p className="text-muted-foreground mb-4">
                Os dados foram importados com sucesso.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={handleClearFile}>
                  Importar mais dados
                </Button>
                <Button onClick={() => navigate(activeTab === "clients" ? "/admin/clientes" : "/admin/veiculos")}>
                  Ver {activeTab === "clients" ? "Clientes" : "Veículos"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Form */}
        {!importComplete && (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="clients" className="gap-2">
                <Users className="h-4 w-4" />
                Clientes
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="gap-2">
                <Car className="h-4 w-4" />
                Veículos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Importar Clientes</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadTemplate("clients")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Template
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Colunas esperadas: Nome, Telefone (obrigatórios), Email, CPF, Endereço, Cidade, Origem, Observações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileUploadZone
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    onClear={handleClearFile}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Importar Veículos</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadTemplate("vehicles")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Template
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Colunas esperadas: Placa, Marca, Modelo, Telefone_Cliente (obrigatórios), Ano, Cor, KM, Chassi, Combustível.
                    O veículo será vinculado ao cliente pelo telefone.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileUploadZone
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    onClear={handleClearFile}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview & Import */}
            {parsedData.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Prévia dos Dados</CardTitle>
                  <CardDescription>
                    Revise os dados antes de importar. Registros com erros não serão importados.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ImportPreviewTable 
                    columns={columns} 
                    rows={parsedData} 
                  />

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleClearFile}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleImport} 
                      disabled={isLoading || validCount === 0}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Importar {validCount} Registros
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}
