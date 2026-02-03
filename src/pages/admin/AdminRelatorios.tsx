import { AdminLayout } from "@/components/layout/AdminLayout";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "@/hooks/useNavigate";

interface ReportCard {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  bgColor: string;
}

const reports: ReportCard[] = [
  {
    title: "Metas",
    description: "Acompanhamento de metas financeiras, operacionais e de crescimento",
    icon: Target,
    path: "/admin/metas",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Analytics Mecânicos",
    description: "Desempenho, pontualidade e qualidade ao longo do tempo",
    icon: TrendingUp,
    path: "/admin/analytics-mecanicos",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Feedback Mecânicos",
    description: "Registro diário de avaliação de performance da equipe",
    icon: MessageSquare,
    path: "/admin/feedback-mecanicos",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

export default function AdminRelatorios() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card border-b border-border">
          <div className="container py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin")}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Relatórios
                </h1>
                <p className="text-sm text-muted-foreground">
                  Central de relatórios e analytics
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container py-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, index) => {
              const Icon = report.icon;
              return (
                <motion.button
                  key={report.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(report.path)}
                  className="card-lovable text-left group hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${report.bgColor} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-6 h-6 ${report.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        {report.title}
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}