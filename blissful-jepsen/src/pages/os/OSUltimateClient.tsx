import { useActiveOS } from "@/hooks/useActiveOS";

export default function OSUltimateClient() {
  const { activeOS, loading } = useActiveOS();

  if (loading) {
    return <div className="p-6">Carregando OS...</div>;
  }

  if (!activeOS) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Nenhuma OS ativa</h2>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <header className="border-b pb-3">
        <h1 className="text-2xl font-bold">
          Ordem de Serviço — {activeOS.vehiclePlate}
        </h1>
        <p className="text-sm text-muted-foreground">
          Status atual: <strong>{activeOS.status}</strong>
        </p>
      </header>

      <section>
        <h3 className="font-semibold mb-2">Descrição</h3>
        <p>{activeOS.description}</p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">Timeline</h3>
        <ul className="text-sm list-disc ml-4">
          <li>OS aberta</li>
          <li>Em diagnóstico</li>
          <li>Aguardando próximos passos</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold mb-2">Evidências</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted h-24 rounded" />
          <div className="bg-muted h-24 rounded" />
          <div className="bg-muted h-24 rounded" />
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-2">Orçamento (prévia)</h3>
        <p className="text-sm text-muted-foreground">
          Orçamento em elaboração. Aguarde aprovação.
        </p>
      </section>
    </div>
  );
}
