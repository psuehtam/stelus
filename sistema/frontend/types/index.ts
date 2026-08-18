export type Perfil = 'admin' | 'funcionario';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  ativo?: boolean;
  criadoEm?: string;
}

export interface Cliente {
  id: number;
  nome: string;
  razaoSocial?: string;
  tipoPessoa: 'fisica' | 'juridica';
  documento?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  limiteProducao: number;
  ativo: boolean;
}

export interface Matriz {
  id: number;
  nome: string;
  referencia?: string;
  qtdPontos: number;
  ativo: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PartePeca {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface Servico {
  id: number;
  clienteId: number;
  matrizId: number;
  partePecaId: number;
  tipoPeca: 'aberta' | 'fechada';
  quantidade: number;
  dataServico: string;
  fechado: boolean;
  cliente?: { id: number; nome: string };
  matriz?: { id: number; nome: string; qtdPontos: number };
  partePeca?: { id: number; nome: string };
  usuario?: { id: number; nome: string };
  atualizadoPor?: number;
  atualizadoPorUsuario?: { id: number; nome: string };
  valorPorMilAplicado?: number | null;
  valorCalculadoHistorico?: number | null;
}

export interface Fechamento {
  id: number;
  clienteId: number;
  periodoInicio: string;
  periodoFim: string;
  valorTotal: number;
  status: 'previa' | 'confirmado' | 'pago';
  documentoPdf?: string;
  cliente?: Cliente;
  totalPago?: number;
  saldo?: number;
}

export interface DashboardData {
  faturamentoTotal: number;
  faturamentoMes: number;
  valorEmAberto: number;
  fechamentosPendentes: number;
  rankingClientes: { nome: string; valor: number }[];
  rankingVolume: { nome: string; quantidade: number }[];
  producaoVsNaoProducao: { producao: number; naoProducao: number };
  evolucaoMensal: { mes: string; valor: number }[];
}
