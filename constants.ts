import { ClassDataMap, ClassificationDataMap, ActivityLogData, UserProfile } from './types';

export const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=3871&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=3958&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?q=80&w=3870&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580541832626-2a7131ee809f?q=80&w=3870&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560174038-da43ac74f01b?q=80&w=3914&auto=format&fit=crop"
];

// Helper para gerar alunos mockados (para outras turmas)
const generateStudents = (count: number) => {
  const names = ["Ana Silva", "Beatriz Costa", "Carlos Oliveira", "Davi Souza", "Eduardo Lima", "Fernanda Rocha", "Gabriel Alves", "Helena Dias", "Igor Martins", "Julia Pereira", "Kaique Santos", "Larissa Gomes", "Miguel Ferreira", "Nicole Ribeiro", "Otávio Castro"];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length] + (i > 14 ? ` ${i}` : ''),
    attendance: {}
  }));
};

// Helper para formatar nomes (Capitalize)
const formatName = (name: string) => {
  return name.toLowerCase().split(' ').map(word => {
    if (['da', 'de', 'do', 'dos', 'das', 'e'].includes(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

const students603Raw = [
  "Thallys Monteiro marchon",
  "annalú Barros Silva Santos",
  "Ana kateryne Machado da Silva",
  "cristal Marisa da Silva Soares",
  "Pedro Lucas Oliveira da Conceição",
  "pyetro Coelho Santana",
  "Enzo de Melo Oliveira",
  "Patrícia da França Gomes dos Santos",
  "Sofia Dutra Viana Lopes",
  "Alice dos Santos Souza sales",
  "Davi Luiz Félix Duarte",
  "Anna ester régis patrício",
  "Ana Beatriz Barreto da Silva",
  "benício diniz barcellos"
];

const students603 = students603Raw.map((name, i) => ({
  id: 60300 + i,
  name: formatName(name),
  attendance: {}
}));

export const initialClassData: ClassDataMap = {
  // 6º Ano
  "601": { id: "601", name: "Turma 601", grade: "6", students: generateStudents(12) },
  "602": { id: "602", name: "Turma 602", grade: "6", students: generateStudents(10) },
  "603": { id: "603", name: "Turma 603", grade: "6", students: students603 },
  
  // 7º Ano
  "711": { id: "711", name: "Turma 711", grade: "7", students: generateStudents(11) },
  "712": { id: "712", name: "Turma 712", grade: "7", students: generateStudents(13) },
  "713": { id: "713", name: "Turma 713", grade: "7", students: generateStudents(9) },
  "721": { id: "721", name: "Turma 721", grade: "7", students: generateStudents(15) },
  "722": { id: "722", name: "Turma 722", grade: "7", students: generateStudents(12) },
  "723": { id: "723", name: "Turma 723", grade: "7", students: generateStudents(10) },
};

export const initialClassificationData: ClassificationDataMap = {
  "611": {
    name: "Ranking Geral",
    students: [
      { position: "1º", name: "Isabella Teixeira", points: "5", wins: 4, losses: 0, draws: 2 },
      { position: "2º", name: "Davi Lucca", points: "4,5", wins: 4, losses: 0, draws: 1 },
      { position: "3º", name: "Alice Caldeira", points: "4", wins: 3, losses: 1, draws: 2 },
    ]
  }
};

export const initialActivityLogData: ActivityLogData = {
  title: "REGISTRO DE ATIVIDADES NAS AULAS DE INICIAÇÃO AO XADREZ",
  header: {
    government: "GOVERNO DO ESTADO DO RIO DE JANEIRO",
    city: "PREFEITURA MUNICIPAL DE MARICÁ",
    department: "SECRETARIA MUNICIPAL DE EDUCAÇÃO",
    school: "ESCOLA MUNICIPAL JOANA BENEDICTA RANGEL",
    professor: "ANDRÉ BRITO",
    project: "PROJETO DE INICIAÇÃO AO XADREZ",
  },
  log: [
    { 
      date: "19/mar", 
      classes: ["601", "602"], 
      activities: [
        "1 - Objetivo de reconhecerem as peças Torre, Cavalo e Peão; suas formações iniciais e seus movimentos básicos.",
        "2 - Progressão pedagógica com aumento do número de peões até chegar ao número total para início do jogo, tendo intenção de massificar a ideia da ordem inicial das peças e seus movimentos."
      ] 
    },
    { 
      date: "27/mar", 
      classes: ["603", "711"],
      activities: [
        "1 - Objetivo de conhecerem os lances especiais de roque pequeno e roque grande.",
        "2 - Introdução da defesa alta e defesa baixa para abertura de peças e feitura de roque.",
        "3 - Deixar bem massificado que o REI nunca sai do tabuleiro ao final da partida."
      ] 
    },
  ]
};

export const mockUserProfile: UserProfile = {
  id: "user_123",
  name: "André Brito",
  email: "andre.brito@escola.com",
  elo: 1450,
  gamesPlayed: 124,
  wins: 68,
  losses: 42,
  draws: 14,
};