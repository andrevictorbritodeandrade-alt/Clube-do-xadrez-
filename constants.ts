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

const students601Raw = [
  "Alanda Lima Muniz",
  "Ana Beatriz Barreto da Silva",
  "Anderson Silva dos Santos",
  "Artur Bastos Nunes Herreira",
  "Arthur Cruz",
  "Aryel Monteiro",
  "Bernardo Lamprecht Piffer da Silva",
  "Carlos Eduardo",
  "Emanuelly Nascimento de Oliveira",
  "Estter Araújo Batista",
  "Gabriel Alves Macedo da Silva",
  "Geovane",
  "Gustavo Reinaldo Lima",
  "Henrique Lemos Tucunduva",
  "Kevin Oliveira Batista",
  "Maria Luiza Magalhães Rondon Coelho",
  "Miguel de Oliveira Gomes",
  "Pedro Cruz Gomes",
  "Pedro Henrique Oliveira da Silva",
  "Rickarlyson",
  "Thiago Souza Botelho",
  "Vitor Bastos Nunes Herreira",
  "Vitória Beatriz de Matos Moraes",
  "Vivian Avelino de Azevedo",
  "Ysabella Ricas Monteiro"
];

const students602Raw = [
  "Agatha de Souza",
  "Alice Costa de Oliveira Martins Clerio",
  "Alice dos Santos Souza Sales",
  "Ana Beatriz da Silva Mendes",
  "Ana Clara",
  "Ana Kateryne Machado da Silva",
  "Ana Sophia Alves da Silva",
  "Anna Ester Régis Patrício",
  "Annalú Barros Silva Santos",
  "Any Carreiro",
  "Arthur Azevedo da Silva Melo",
  "Benício Diniz Barcellos",
  "Cristal Marisa da Silva Soares",
  "Davi Leal Figueiredo",
  "Davi Luiz Félix Duarte",
  "Davi Silva de Araújo",
  "Enzo de Melo Oliveira",
  "Glória Nery Mendes Xavier",
  "João Gabriel",
  "João Vitor",
  "Joaquim Miguel Pacheco da Silva",
  "Laura dos Santos Fidelis Batista",
  "Laura Lima Nogueira",
  "Luís Otávio Rocha de Azevedo",
  "Maria Luiza Vigneron Loppes",
  "Mayra Carla"
];

const students603Raw = [
  "Alicia Vitória Silva dos Santos",
  "Arnaldo Barbosa Vilaça Junior",
  "Arthur Coutinho Oliveira",
  "Arthur Nogueira Pinto da Silva",
  "Beatriz Vidal Machado",
  "Breno Henrique Souza de Oliveira",
  "Catarina Santiago Martins",
  "Davi Lucca Duarte Bastos",
  "Fabiano Rocha de Oliveira Júnior",
  "Fábiolla Gabryella Bach do Rosário Pereira",
  "Fernanda Isaías",
  "Gabriel Costa de Azevedo",
  "João Miguel Henriques Brum",
  "Laís Moura Oliveira",
  "Lavinnia da Rocha Fortes",
  "Leidania Jules",
  "Luiz Henrique Marchi Azevedo de Oliveira",
  "Mariana Tostes Esteves da Silva",
  "Miguel Macedo Conceição",
  "Moisés Santiago José de Araújo",
  "Nathália de Melo Ferreira",
  "Pedro Joaquim Macedo Simões Silva",
  "Peron Perez dos Santos Leite",
  "Pietro dos Santos Barcellos",
  "Piettra Moreira"
];

const students604Raw = [
  "Manuela da Silva Gomes",
  "Arthur Mendonça da Silva",
  "Sthefany Vitória Valadares Neves da Silva",
  "Paulo Sérgio Batista de Souza",
  "Nina Pacheco Dias da Silva",
  "Isaque Oliveira Matos dos Santos",
  "Laura Neves",
  "Richard EIke",
  "Milena Gonçalves Rodrigues",
  "Mirella Ramos dos Santos Gomes",
  "Patrícia da França Gomes dos Santos",
  "Pyetro Coelho Santana",
  "Rafaela Alves Freitas Passos",
  "Sofia Dutra Viana Lopes",
  "Thallys Monteiro Marchon",
  "Ygo de Castro Santana",
  "Pedro Lucas Oliveira da Conceição",
  "Thayna de Araújo Fonseca da Silva",
  "Ana Luiza Guedes Portilho",
  "Isaías Alexsander Evangelista Paiva",
  "João Gabriel",
  "José Bernardo Silva Valadares",
  "Júlia Franco de Souza Campos",
  "Júlia Melo de Alencar",
  "Luca Ávila Monken",
  "Juliana Monteiro Diniz",
  "Safira de Aguiar Oliveira"
];

const createStudents = (rawList: string[], classId: string) => {
  return rawList.map((name, i) => {
    const attendance: { [date: string]: 'H1' | 'H2' | 'H3' | 'H4' | 'F' | null } = {};
    
    // Frequência de 09/03 para a Turma 603
    if (classId === '603') {
      const present603 = [
        "Alicia Vitória Silva dos Santos",
        "Arnaldo Barbosa Vilaça Junior",
        "Arthur Coutinho Oliveira",
        "Arthur Nogueira Pinto da Silva",
        "Beatriz Vidal Machado",
        "Breno Henrique Souza de Oliveira",
        "Catarina Santiago Martins",
        "Davi Lucca Duarte Bastos",
        "Fábiolla Gabryella Bach do Rosário Pereira",
        "Gabriel Costa de Azevedo"
      ];
      const absent603 = [
        "Fabiano Rocha de Oliveira Júnior",
        "Fernanda Isaías",
        "João Miguel Henriques Brum"
      ];
      
      if (present603.includes(name)) attendance["09/03"] = "H1";
      if (absent603.includes(name)) attendance["09/03"] = "F";
    }

    // Frequência de 09/03 para a Turma 604
    if (classId === '604') {
      const present604 = [
        "Manuela da Silva Gomes",
        "Arthur Mendonça da Silva",
        "Laura Neves",
        "Patrícia da França Gomes dos Santos",
        "Pyetro Coelho Santana",
        "Rafaela Alves Freitas Passos"
      ];
      const absent604 = [
        "Sthefany Vitória Valadares Neves da Silva",
        "Paulo Sérgio Batista de Souza",
        "Nina Pacheco Dias da Silva",
        "Isaque Oliveira Matos dos Santos",
        "Richard EIke",
        "Milena Gonçalves Rodrigues",
        "Mirella Ramos dos Santos Gomes"
      ];
      
      if (present604.includes(name)) attendance["09/03"] = "H1";
      if (absent604.includes(name)) attendance["09/03"] = "F";
    }

    return {
      id: parseInt(classId) * 100 + i,
      name: name,
      attendance: attendance
    };
  });
};

export const initialClassData: ClassDataMap = {
  "601": { id: "601", name: "Turma 601", grade: "6", students: createStudents(students601Raw, "601") },
  "602": { id: "602", name: "Turma 602", grade: "6", students: createStudents(students602Raw, "602") },
  "603": { id: "603", name: "Turma 603", grade: "6", students: createStudents(students603Raw, "603") },
  "604": { id: "604", name: "Turma 604", grade: "6", students: createStudents(students604Raw, "604") }
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
