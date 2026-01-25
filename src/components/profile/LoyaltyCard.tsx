import { Award, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface LoyaltyCardProps {
  cashback: number;
  level: string;
  progress: number;
}

const loyaltyConfig: Record<string, { label: string; color: string; icon: typeof Award }> = {
  bronze: { label: "Bronze", color: "from-amber-700 to-amber-600", icon: Award },
  silver: { label: "Prata", color: "from-slate-400 to-slate-300", icon: Award },
  gold: { label: "Ouro", color: "from-yellow-500 to-yellow-400", icon: Award },
  platinum: { label: "Platinum", color: "from-slate-600 to-slate-400", icon: Crown },
};

export function LoyaltyCard({ cashback, level, progress }: LoyaltyCardProps) {
  const config = loyaltyConfig[level] || loyaltyConfig.bronze;
  const Icon = config.icon;

  return (
    <Card className={`bg-gradient-to-r ${config.color} border-0 text-white`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm">Seu cashback</p>
            <p className="text-3xl font-bold">
              R$ {cashback.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
            <Icon className="w-4 h-4" />
            <span className="font-medium text-sm">{config.label}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Progresso para próximo nível</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </div>
      </CardContent>
    </Card>
  );
}
