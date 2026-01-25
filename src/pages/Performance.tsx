import { useNavigate } from "react-router-dom";
import { ArrowLeft, Rocket, Sparkles, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Performance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0a0a] to-[#0a0a0a] text-white overflow-hidden relative">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-red-500/15 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px]" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/60 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-white/10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold">Visão Geral</h1>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        {/* Icon Container */}
        <div className="relative mb-8">
          {/* Outer ring animation */}
          <div className="absolute inset-0 w-40 h-40 -m-4 rounded-full border-2 border-red-500/30 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 w-36 h-36 -m-2 rounded-full border border-red-500/20 animate-spin" style={{ animationDuration: '8s' }} />
          
          {/* Main icon */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/40">
            <Rocket className="w-16 h-16 text-white animate-bounce" style={{ animationDuration: '2s' }} />
          </div>

          {/* Sparkle decorations */}
          <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-pulse" />
          <Star className="absolute -bottom-1 -left-3 w-6 h-6 text-yellow-400 animate-pulse delay-500" />
          <Zap className="absolute top-0 -left-4 w-5 h-5 text-red-400 animate-pulse delay-1000" />
        </div>

        {/* Title */}
        <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent">
          Em Construção
        </h2>

        {/* Subtitle */}
        <p className="text-xl text-gray-300 mb-2 font-medium">
          Algo incrível está chegando!
        </p>
        <p className="text-gray-500 max-w-sm mb-8">
          Estamos preparando uma experiência épica para você acompanhar toda sua jornada com a Doctor Auto Prime.
        </p>

        {/* Feature Preview Cards */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center">
            <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl">📊</span>
            </div>
            <span className="text-xs text-gray-400">Estatísticas</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center">
            <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl">🏆</span>
            </div>
            <span className="text-xs text-gray-400">Conquistas</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex flex-col items-center">
            <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl">💰</span>
            </div>
            <span className="text-xs text-gray-400">Economia</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-8 py-6 rounded-full shadow-lg shadow-red-600/30 transition-all hover:scale-105"
          onClick={() => navigate(-1)}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Voltar ao Perfil
        </Button>

        {/* Footer text */}
        <p className="mt-8 text-sm text-gray-600">
          Fique ligado nas novidades! 🔥
        </p>
      </main>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
