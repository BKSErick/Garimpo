"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Plus,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Zap,
  Globe,
  MessageSquare,
  BarChart3,
  Loader2,
  Layers,
  Sparkles,
  Activity,
  Target,
  Database,
  ExternalLink,
  ChevronRight,
  Download,
  Trello,
  Mail
} from "lucide-react";

import { CardMiner, CardMinerHeader, CardMinerTitle } from "@/components/ui/CardMiner";
import { ButtonMiner } from "@/components/ui/ButtonMiner";
import { BadgeMiner } from "@/components/ui/BadgeMiner";

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar leads:", err);
        setLoading(false);
      });
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.niche || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.diagnosis?.niche || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "TODOS" || 
      lead.status.toUpperCase() === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    if (filteredLeads.length === 0) return;
    
    const headers = ["Nome", "Nicho", "Status", "Email", "Telefone", "Endereço", "Score", "Vulnerabilidade"];
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map(lead => [
        `"${lead.name}"`,
        `"${lead.niche || lead.diagnosis?.niche || ''}"`,
        `"${lead.status}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.address || ''}"`,
        lead.score || 0,
        `"${lead.diagnosis?.vulnerability_level || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_finch_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="relative">
        <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse" />
        <Loader2 className="animate-spin text-primary relative" size={64} />
      </div>
      <div className="text-center">
        <p className="text-[12px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Sincronizando Dossiê de Inteligência...</p>
        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-2 opacity-40 italic">Acessando Kernel ProspectOS v1.0</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto flex flex-col gap-10 animate-in fade-in duration-1000">
      
      {/* Intelligence Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 bg-black/40 border border-white/5 p-10 rounded-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
        <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
           <Database size={200} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
             <BadgeMiner variant="primary" className="py-1 px-3 text-[9px]">Intelligence Hub</BadgeMiner>
             <div className="h-4 w-px bg-white/10" />
             <span className="text-text-muted text-[10px] font-black uppercase tracking-widest opacity-40 italic">RELATÓRIO GLOBAL DE EXTRAÇÃO</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-white">
            CENTRAL DE <span className="text-primary">INTELIGÊNCIA</span>
          </h1>
          <p className="text-[11px] text-text-muted uppercase font-black tracking-[0.4em] mt-2 opacity-60">
            Acesso bruto a todos os prospectos minerados e seus respectivos diagnósticos.
          </p>
        </div>

        <div className="flex items-center gap-4">
           <ButtonMiner 
            variant="outline" 
            icon={Download} 
            onClick={exportToCSV}
            className="h-16 px-8 border-white/10 text-text-muted hover:text-white"
           >
            EXPORTAR BASE
           </ButtonMiner>
           <ButtonMiner 
            onClick={() => router.push("/dashboard/campanhas/nova")}
            icon={Plus}
            className="h-16 px-10 shadow-purple text-xs tracking-widest"
           >
            NOVA SONDA
           </ButtonMiner>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-sm">
         <div className="flex items-center gap-6">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted opacity-40" size={16} />
               <input 
                 placeholder="FILTRAR POR NOME OU NICHO..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="bg-black/40 border border-white/5 h-12 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-primary/40 transition-all rounded-sm w-[300px]"
               />
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-4">
               <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">STATUS:</span>
               <div className="flex gap-2">
                  {['TODOS', 'QUALIFICADO', 'EXTRAÍDO'].map(f => (
                     <button 
                       key={f} 
                       onClick={() => setFilterStatus(f)}
                       className={`px-3 py-1.5 rounded-sm text-[9px] font-black tracking-widest border transition-all ${f === filterStatus ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-transparent border-white/5 text-text-muted hover:text-white'}`}
                     >
                        {f}
                     </button>
                  ))}
               </div>
            </div>
         </div>
         <div className="flex items-center gap-3 text-[10px] font-black text-text-muted uppercase tracking-widest opacity-40">
            <Layers size={14} />
            EXIBINDO {filteredLeads.length} REGISTROS
         </div>
      </div>

      {/* Intelligence Grid */}
      <CardMiner className="p-0 overflow-hidden border-white/5 bg-black/20">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                {[
                  { label: "PROSPECTO", icon: Target },
                  { label: "STATUS IA", icon: Sparkles },
                  { label: "LOCALIZAÇÃO", icon: Globe },
                  { label: "EMAIL", icon: Mail },
                  { label: "VULNERABILIDADE", icon: ShieldAlert },
                  { label: "MINER SCORE", icon: BarChart3 },
                  { label: "AÇÕES", icon: ArrowRight }
                ].map(h => (
                  <th key={h.label} className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
                    <div className="flex items-center gap-2">
                       <h.icon size={12} className="opacity-40" />
                       {h.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center opacity-20">
                    <Database size={64} className="mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhum resultado encontrado</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-white/[0.02] transition-all border-l-2 border-transparent hover:border-primary">
                    <td className="px-8 py-6">
                      <div className="font-black text-sm uppercase tracking-tight text-white group-hover:text-primary transition-colors leading-none">{lead.name}</div>
                      <div className="text-[9px] text-text-muted font-bold mt-2 tracking-widest opacity-40 uppercase">{lead.niche || lead.diagnosis?.niche || "SEGMENTO GERAL"}</div>
                    </td>
                    <td className="px-8 py-6">
                      <BadgeMiner variant={lead.status === 'qualificado' ? 'primary' : 'muted'} className="text-[8px] px-3 py-0.5 tracking-widest">
                        {lead.status.toUpperCase()}
                      </BadgeMiner>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted/60 uppercase tracking-widest">
                         <Globe size={12} className="opacity-40" />
                         {lead.address ? lead.address.split(',')[0] : "COORDENADA OCULTA"}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {lead.email ? (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-2 text-[10px] font-bold text-primary/70 hover:text-primary transition-colors uppercase tracking-widest"
                          onClick={e => e.stopPropagation()}
                        >
                          <Mail size={12} className="opacity-60" />
                          {lead.email}
                        </a>
                      ) : (
                        <span className="text-[9px] text-text-muted/20 font-black tracking-widest italic">NÃO EXTRAÍDO</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                       {lead.diagnosis?.vulnerability_level ? (
                          <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                             <div className={`w-1.5 h-1.5 rounded-full ${lead.diagnosis.vulnerability_level === 'Crítica' ? 'bg-error animate-pulse' : 'bg-primary'}`} />
                             {lead.diagnosis.vulnerability_level}
                          </div>
                       ) : (
                          <span className="text-[9px] text-text-muted/20 font-black tracking-widest italic">AGUARDANDO...</span>
                       )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={`h-full shadow-purple transition-all duration-1000 ${
                              (lead.score || 0) >= 80 ? 'bg-primary' : (lead.score || 0) >= 50 ? 'bg-orange-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${lead.score || 0}%` }} 
                          />
                        </div>
                        <span className="font-black text-xs text-white tracking-tighter">{lead.score || 0}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <ButtonMiner
                          variant="outline"
                          icon={MessageSquare}
                          onClick={() => {
                            if (lead.phone) {
                              window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank');
                            }
                          }}
                          className={`h-10 w-10 p-0 flex items-center justify-center border-white/5 ${!lead.phone ? 'opacity-20 cursor-not-allowed' : 'hover:bg-success/10 hover:text-success hover:border-success/30'}`}
                          title={lead.phone ? "Abordagem Direta" : "Telefone Indisponível"}
                        />
                        <ButtonMiner
                          variant="outline"
                          icon={Trello}
                          onClick={() => router.push(`/dashboard/kanban?lead=${lead.id}`)}
                          className="h-10 w-10 p-0 flex items-center justify-center border-white/5 hover:border-orange-500/40 hover:text-orange-400 transition-all"
                          title="Ver no Kanban"
                        />
                        <ButtonMiner
                          variant="outline"
                          icon={ChevronRight}
                          onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                          className="h-10 w-10 p-0 flex items-center justify-center border-white/5 hover:border-primary/40 hover:text-primary transition-all"
                          title="Ver Dossiê Completo"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardMiner>
    </div>
  );
}
