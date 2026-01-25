import { useState } from "react";
import { Bird, Plus, ArrowLeft, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  symbol: 'corinthians' | 'pombo';
  tasks: Task[];
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

// Initial mock data
const initialTeamMembers: TeamMember[] = [
  { id: '1', name: 'THALES', symbol: 'corinthians', tasks: [
    { id: 't1', text: 'Verificar OS #2024-001', completed: false },
    { id: 't2', text: 'Ligar para cliente João', completed: true },
  ]},
  { id: '2', name: 'PEDRO', symbol: 'pombo', tasks: [
    { id: 'p1', text: 'Finalizar diagnóstico BMW', completed: false },
  ]},
  { id: '3', name: 'JOAO', symbol: 'pombo', tasks: [
    { id: 'j1', text: 'Trocar óleo do Golf', completed: false },
    { id: 'j2', text: 'Balanceamento Corolla', completed: false },
  ]},
];

export default function Pendencias() {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  // Count pending tasks
  const totalPending = teamMembers.reduce(
    (acc, member) => acc + member.tasks.filter(t => !t.completed).length, 
    0
  );

  const toggleTask = (memberId: string, taskId: string) => {
    setTeamMembers(prev => prev.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          tasks: member.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return member;
    }));
  };

  const addTask = (memberId: string) => {
    const taskText = newTaskInputs[memberId]?.trim();
    if (!taskText) return;

    setTeamMembers(prev => prev.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          tasks: [...member.tasks, { id: `${memberId}-${Date.now()}`, text: taskText, completed: false }]
        };
      }
      return member;
    }));
    setNewTaskInputs(prev => ({ ...prev, [memberId]: '' }));
  };

  const removeTask = (memberId: string, taskId: string) => {
    setTeamMembers(prev => prev.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          tasks: member.tasks.filter(task => task.id !== taskId)
        };
      }
      return member;
    }));
  };

  const clearCompleted = (memberId: string) => {
    setTeamMembers(prev => prev.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          tasks: member.tasks.filter(task => !task.completed)
        };
      }
      return member;
    }));
  };

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
      </div>
    </AdminLayout>
  );
}
