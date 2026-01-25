import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Car, Plus, ArrowLeft } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

const Veiculos = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#111] border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Meus Veículos</h1>
      </header>

      {/* Main Content */}
      <main className="p-4 pb-24 max-w-2xl mx-auto">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
            <Car className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Nenhum veículo cadastrado</h2>
          <p className="text-gray-400 text-center mb-6">
            Adicione seu primeiro veículo para acompanhar serviços e manutenções.
          </p>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Veículo
          </Button>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Veiculos;
