import { useState, useEffect } from "react";
import { Bird, Plus, ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Pendencia {
  id: string;
  titulo: string;
  status: string;
  mechanic_id: string | null;
}

interface Mechanic {
  id: string;
  name: string;
}

interface TeamMember {
  id: string;
  name: string;
  symbol: 'corinthians' | 'pombo';
  tasks: { id: string; text: string; completed: boolean }[];
}

// Corinthians SVG Symbol - Timão
const CorinthiansIcon = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
    <circle cx="50" cy="50" r="48" fill="#000000" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="#FFFFFF" strokeWidth="3" />
    <path
      d="M50 15 L55 35 L75 35 L60 48 L67 68 L50 55 L33 68 L40 48 L25 35 L45 35 Z"
      fill="#FFFFFF"
    />
    <text x="50" y="88" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">SCCP</text>
  </svg>
);

export default function Pendencias() {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch mechanics
      const { data: mechanics } = await supabase
        .from('mechanics')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      // Fetch pending tasks
      const { data: pendencias } = await supabase
        .from('pendencias')
        .select('id, titulo, status, mechanic_id')
        .order('created_at', { ascending: false });

      if (mechanics) {
        const members: TeamMember[] = mechanics.map((m, index) => ({
          id: m.id,
          name: m.name.toUpperCase(),
          symbol: index === 0 ? 'corinthians' : 'pombo',
          tasks: (pendencias || [])
            .filter(p => p.mechanic_id === m.id)
            .map(p => ({
              id: p.id,
              text: p.titulo,
              completed: p.status === 'resolvido'
            }))
        }));
        setTeamMembers(members);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Count pending tasks
  const totalPending = teamMembers.reduce(
    (acc, member) => acc + member.tasks.filter(t => !t.completed).length, 
    0
  );

  const toggleTask = async (memberId: string, taskId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    const task = member?.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.completed ? 'pendente' : 'resolvido';
    
    const { error } = await supabase
      .from('pendencias')
      .update({ 
        status: newStatus,
        resolved_at: newStatus === 'resolvido' ? new Date().toISOString() : null
      })
      .eq('id', taskId);

    if (!error) {
      setTeamMembers(prev => prev.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            tasks: m.tasks.map(t => 
              t.id === taskId ? { ...t, completed: !t.completed } : t
            )
          };
        }
        return m;
      }));
    }
  };

  const addTask = async (memberId: string) => {
    const taskText = newTaskInputs[memberId]?.trim();
    if (!taskText) return;

    const { data, error } = await supabase
      .from('pendencias')
      .insert({
        titulo: taskText,
        mechanic_id: memberId,
        status: 'pendente',
        tipo: 'tarefa'
      })
      .select()
      .single();

    if (!error && data) {
      setTeamMembers(prev => prev.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            tasks: [...m.tasks, { id: data.id, text: taskText, completed: false }]
          };
        }
        return m;
      }));
      setNewTaskInputs(prev => ({ ...prev, [memberId]: '' }));
      toast.success("Tarefa adicionada");
    }
  };

  const removeTask = async (memberId: string, taskId: string) => {
    const { error } = await supabase
      .from('pendencias')
      .delete()
      .eq('id', taskId);

    if (!error) {
      setTeamMembers(prev => prev.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            tasks: m.tasks.filter(t => t.id !== taskId)
          };
        }
        return m;
      }));
    }
  };

  const clearCompleted = async (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    const completedIds = member?.tasks.filter(t => t.completed).map(t => t.id) || [];
    
    if (completedIds.length === 0) return;

    const { error } = await supabase
      .from('pendencias')
      .delete()
      .in('id', completedIds);

    if (!error) {
      setTeamMembers(prev => prev.map(m => {
        if (m.id === memberId) {
          return {
            ...m,
            tasks: m.tasks.filter(t => !t.completed)
          };
        }
        return m;
      }));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Pendências do Dia</h1>
            <p className="text-muted-foreground">{totalPending} tarefa(s) pendente(s)</p>
          </div>
        </div>

        {/* Team Members with Tasks */}
        {teamMembers.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <Bird className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum mecânico cadastrado</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const pendingCount = member.tasks.filter(t => !t.completed).length;
              const completedCount = member.tasks.filter(t => t.completed).length;

              return (
                <Card key={member.id} className="border overflow-hidden">
                  {/* Member header */}
                  <div className="p-4 bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {member.symbol === 'corinthians' ? (
                        <CorinthiansIcon size={32} />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Bird className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-foreground text-lg">{member.name}</span>
                        <p className="text-sm text-muted-foreground">
                          {pendingCount} pendente{pendingCount !== 1 ? 's' : ''} • {completedCount} concluída{completedCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {completedCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => clearCompleted(member.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Limpar concluídas
                      </Button>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    {/* Tasks list */}
                    <div className="space-y-3">
                      {member.tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 group"
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(member.id, task.id)}
                          />
                          <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.text}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTask(member.id, task.id)}
                            className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      
                      {member.tasks.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhuma tarefa. Adicione uma abaixo.
                        </p>
                      )}
                      
                      {/* Add new task */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border mt-3">
                        <Input
                          placeholder="Nova tarefa..."
                          value={newTaskInputs[member.id] || ''}
                          onChange={(e) => setNewTaskInputs(prev => ({ ...prev, [member.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && addTask(member.id)}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => addTask(member.id)}
                          className="gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
