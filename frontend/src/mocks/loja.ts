import type {
  DadosLoja,
  PreferenciasAcessibilidade,
  Restaurante,
  SessaoAtiva,
  UsuarioEquipe,
} from "@/types";
import { diasAtras, minutosAtras } from "./util";

export const restauranteMock: Restaurante = {
  nomeEstabelecimento: "Da Esquina",
  endereco: "Avenida Fulano de Tal, 1212 — Porto Alegre, RS",
  descricao: "Lanches, pratos feitos e açaí desde 2019. Entrega rápida no Centro Histórico e Cidade Baixa.",
  imagem: undefined,
  notaMedia: 4.7,
  totalAvaliacoes: 135,
  tempoRetiradaMin: 15,
  tempoEntregaMin: 45,
  plano: "pro",
};

export const dadosLojaMock: DadosLoja = {
  rua: "Avenida Fulano de Tal",
  numero: "1212",
  complemento: "Em frente ao bar do Zé",
  cidade: "Porto Alegre",
  estado: "Rio Grande do Sul",
  cep: "90010-000",
  razaoSocial: "Fulano de Tal Alimentos LTDA",
  cnpj: "12.345.678/0001-90",
  chavePix: "financeiro@daesquina.com.br",
  tipoChavePix: "Email",
  telefone: "(51) 3333-4444",
  email: "contato@daesquina.com.br",
};

export const acessibilidadeMock: PreferenciasAcessibilidade = {
  tutorialVisto: false,
  narrador: false,
  daltonismo: false,
  modoEscuro: false,
  alertaSonoro: true,
  animacoes: true,
};

export const sessoesMock: SessaoAtiva[] = [
  { id: "s1", dispositivo: "Chrome · Windows", local: "Porto Alegre, RS", ultimoAcesso: minutosAtras(1), atual: true },
  { id: "s2", dispositivo: "App Tasty · Android", local: "Porto Alegre, RS", ultimoAcesso: minutosAtras(95), atual: false },
  { id: "s3", dispositivo: "Safari · iPhone", local: "Canoas, RS", ultimoAcesso: diasAtras(6), atual: false },
];

export const equipeMock: UsuarioEquipe[] = [
  { id: "u1", nome: "Felipe L.", email: "felipe@daesquina.com.br", papel: "Proprietário" },
  { id: "u2", nome: "Marina Souza", email: "marina@daesquina.com.br", papel: "Gerente" },
  { id: "u3", nome: "Caio Pereira", email: "caio@daesquina.com.br", papel: "Atendente" },
  { id: "u4", nome: "Rita Gomes", email: "cozinha@daesquina.com.br", papel: "Cozinha" },
];
