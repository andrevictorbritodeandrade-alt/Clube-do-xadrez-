import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface ExercisesViewProps {
  onBack: () => void;
}

type CategoryType = 'mate' | 'tactics' | 'defense' | 'opening';

interface Exercise {
  id: number;
  category: CategoryType;
  fen?: string; 
  white: string; 
  black: string;
  question: string;
  solution: string[]; 
  hint?: string;
}

// --- DATA: 15 Exercises per Category ---
const EXERCISES_DATA: Exercise[] = [
  // --- MATE (Xeque-Mate em 1 lance) ---
  { 
    id: 101, category: 'mate',
    fen: '6rk/5Qpp/8/8/8/8/6PP/6K1 w - - 0 1',
    white: "Dama e Peões", black: "Rei preso",
    question: "Mate do Corredor: O Rei preto está preso pelos próprios peões.",
    solution: ["f7g8"], hint: "Capture a Torre ou mova para o fundo." 
  },
  { 
    id: 102, category: 'mate',
    fen: 'r1b2r1k/pp1p1p1p/2n1pP2/8/2P5/3B2Q1/P4PPP/R4RK1 w - - 1 1',
    white: "Ataque na ala do Rei", black: "Defesa frágil",
    question: "Mate com a Dama: Aproveite a coluna g aberta ou o peão avançado.",
    solution: ["g3g7"], hint: "A Dama apoiada pelo peão de f6 é mortal."
  },
  { 
    id: 103, category: 'mate',
    fen: '7k/7p/5N2/8/8/8/6R1/6K1 w - - 0 1',
    white: "Torre e Cavalo", black: "Rei no canto",
    question: "Mate Árabe: Uma combinação clássica de Torre e Cavalo.",
    solution: ["g2g8"], hint: "A Torre tira as colunas, o Cavalo tira as casas de fuga."
  },
  { 
    id: 104, category: 'mate',
    fen: 'rnbqkbnr/ppppp2p/5p2/6p1/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
    white: "Abertura", black: "Erro na abertura",
    question: "Mate do Louco (Padrão): As pretas enfraqueceram a diagonal do Rei.",
    solution: ["d1h5"], hint: "A Dama branca pode entrar na diagonal h5-e8."
  },
  {
    id: 105, category: 'mate',
    fen: '5rk1/5Npp/8/8/8/8/Q5PP/6K1 w - - 0 1',
    white: "Dama e Cavalo", black: "Rei e Torre",
    question: "Mate Sufocado (Philidor): O Rei está preso por suas próprias peças.",
    solution: ["f7h6"], hint: "Xeque duplo com Cavalo."
  },
  {
    id: 106, category: 'mate',
    fen: '6rk/6pp/5N2/8/8/8/Q7/6K1 w - - 0 1', 
    white: "Dama e Cavalo", black: "Rei preso",
    question: "Mate com Dama e Cavalo: As pretas não têm escapatória.",
    solution: ["a2g8"], hint: "A Dama protegida pelo Cavalo."
  },
  {
    id: 107, category: 'mate',
    fen: '4r2k/2R3pp/8/8/8/8/6PP/6K1 w - - 0 1',
    white: "Torre no fundo", black: "Rei preso",
    question: "Mate na Oitava: O Rei não tem 'respiro'.",
    solution: ["c7c8"], hint: "Leve a torre para a última fileira."
  },
  {
    id: 108, category: 'mate',
    fen: '3q1rk1/5ppp/8/8/8/5B2/5Q2/6K1 w - - 0 1',
    white: "Dama e Bispo", black: "Roque",
    question: "Bateria Dama + Bispo: Destrua a defesa em g7/h7.",
    solution: ["f2g7"], hint: "Aponte suas peças para o peão g7." 
  },
  {
    id: 109, category: 'mate',
    fen: '2r3k1/5ppp/8/8/8/2Q5/8/6PP/6K1 w - - 0 1',
    white: "Dama vs Torre", black: "Rei Fundo",
    question: "Mate Tático: A torre preta está indefesa na prática.",
    solution: ["c4c8"], hint: "Capture a torre, o mate é inevitável."
  },
  {
    id: 110, category: 'mate',
    fen: '5r1k/4Nppp/8/8/1R6/8/8/7K w - - 0 1',
    white: "Torre e Cavalo", black: "Rei h8",
    question: "Mate de Anastasia: O Cavalo tira g8 e g6, a Torre finaliza.",
    solution: ["b4h4"], hint: "A Torre ataca pela coluna 'h'."
  },
  {
    id: 111, category: 'mate',
    fen: 'k7/p7/K7/1R6/8/8/8/8 w - - 0 1',
    white: "Torre e Rei", black: "Rei preso",
    question: "Mate com Torre: O Rei branco ajuda a prender o Rei preto.",
    solution: ["b5b8"], hint: "A Torre deve ir para a última linha."
  },
  {
    id: 113, category: 'mate', 
    fen: '4k3/4P3/4K3/8/8/8/8/8 w - - 0 1',
    white: "Rei e Peão", black: "Rei",
    question: "Não afogue! Promova para ganhar.",
    solution: ["e7e8q"], hint: "Promova o peão." 
  },
  {
    id: 114, category: 'mate',
    fen: 'rn1qkbnr/ppp2ppp/3p4/4p3/2B1P1b1/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    white: "Dama f3", black: "Bispo g4",
    question: "Mate do Pastor (Ideia): A Dama ataca f7.",
    solution: ["f3f7"], hint: "A casa f7 é a mais fraca."
  },
  {
    id: 115, category: 'mate',
    fen: 'k7/p7/2B5/8/8/1B6/8/7K w - - 0 1',
    white: "Dois Bispos", black: "Rei Canto",
    question: "Mate de Bispos: O par de bispos corta as diagonais.",
    solution: ["b3d5"], hint: "Xeque com o bispo de casas claras."
  },

  // --- TACTICS (Garfo, Cravada, Espeto) ---
  { 
    id: 201, category: 'tactics',
    fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
    white: "Abertura", black: "Peão e5",
    question: "Garfo de Abertura: Um golpe comum na Italiana/Ruy Lopez.",
    solution: ["d2d4"], hint: "Ataque o centro com d4."
  },
  {
    id: 202, category: 'tactics',
    fen: '4k3/8/4n3/8/4R3/8/8/4K3 w - - 0 1',
    white: "Torre", black: "Cavalo e Rei",
    question: "A Cravada (Pin): O Cavalo não pode mover.",
    solution: ["e4e6"], hint: "O cavalo está cravado, capture-o."
  },
  {
    id: 203, category: 'tactics',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    white: "Nf3", black: "e5",
    question: "Contra-Ataque: As brancas atacaram e5. Como defender?",
    solution: ["b8c6"], hint: "Desenvolva o Cavalo protegendo o peão."
  },
  {
    id: 204, category: 'tactics',
    fen: '3r2k1/p4ppp/1p6/8/3n4/8/PP3PPP/3R2K1 w - - 0 1',
    white: "Torre d1", black: "Cavalo d4",
    question: "Cravada Relativa: O cavalo preto está cravado pela Torre branca?",
    solution: ["g1f1"], hint: "Mova o Rei para sair do possível xeque."
  },
  {
    id: 206, category: 'tactics',
    fen: 'r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1',
    white: "Cavalo", black: "Rei e Torre",
    question: "Garfo em c7: Onde o cavalo deve pousar?",
    solution: ["b5c7"], hint: "Ataque o Rei e a Torre."
  },
  {
    id: 207, category: 'tactics',
    fen: 'q3k3/8/8/8/8/8/8/3R2K1 w - - 0 1',
    white: "Torre", black: "Rei e Dama",
    question: "Espeto de Torre: O Rei está na mesma coluna da Dama.",
    solution: ["d1e1"], hint: "Dê xeque na coluna 'e'."
  },
  {
    id: 208, category: 'tactics',
    fen: 'r1bqk8/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    white: "Italiana", black: "Normal",
    question: "Ataque Duplo em f7: Qual lance inicia o ataque?",
    solution: ["f3g5"], hint: "O cavalo salta para atacar f7 junto com o bispo."
  },
  {
    id: 209, category: 'tactics',
    fen: 'rnbqkbnr/pppp1ppp/8/8/4Pp2/5N2/PPPP2PP/RNBQKB1R b KQkq - 0 1',
    white: "Gambito", black: "Aceitou",
    question: "Descoberto: Se o peão d2 mover, o que acontece?",
    solution: ["d7d5"], hint: "Contra-ataque no centro com d5."
  },
  {
    id: 210, category: 'tactics',
    fen: 'rnbqkbnr/ppp2ppp/8/3p4/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 1',
    white: "Centro", black: "Centro",
    question: "Troca favorável? Capture o peão.",
    solution: ["e4d5"], hint: "Capture em d5."
  },
  {
    id: 211, category: 'tactics',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1',
    white: "4 Cavalos", black: "Simétrico",
    question: "Cravada no Cavalo: Crave o cavalo f6.",
    solution: ["c1g5"], hint: "O Bispo vai a g5."
  },
  {
    id: 212, category: 'tactics',
    fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR w KQkq - 0 1',
    white: "Abertura", black: "Cavalo f6",
    question: "Gambito de Viena: Jogue f4.",
    solution: ["f2f4"], hint: "Peão f4."
  },
  {
    id: 213, category: 'tactics',
    fen: 'rn1qkbnr/ppp1pppp/8/3p4/4P1b1/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
    white: "Cravada", black: "Bispo g4",
    question: "Saindo da Cravada: Desenvolva o Bispo.",
    solution: ["f1e2"], hint: "Desenvolva o Bispo para e2."
  },
  {
    id: 214, category: 'tactics',
    fen: 'r3k2r/ppp2ppp/2n2n2/3q4/3P4/5B2/PPP2PPP/R1BQK2R w KQkq - 0 1',
    white: "Bispo f3", black: "Dama d5",
    question: "Ataque a Dama (Ganho de Tempo): O Bispo pode atacar a Dama?",
    solution: ["f3d5"], hint: "Capture a Dama!"
  },
  {
    id: 215, category: 'tactics',
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1',
    white: "Ruy Lopez", black: "Morphy Defense",
    question: "Expulsando a Peça: Ataque o Bispo branco.",
    solution: ["a7a6"], hint: "Avance o peão da torre."
  },

  // --- DEFENSE ---
  {
    id: 301, category: 'defense',
    fen: 'rnbqk1nr/pppp1ppp/8/4p3/1b2P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    white: "Rei em Xeque", black: "Bispo b4",
    question: "Bloqueio: O Bispo preto dá xeque. Cubra com o peão.",
    solution: ["c2c3"], hint: "Avance o peão de c2."
  },
  {
    id: 302, category: 'defense',
    fen: 'rnbqkbnr/pppp1ppp/8/8/4P2Q/8/PPP2PPP/RNB1KBNR b KQkq - 0 1',
    white: "Dama h4", black: "Ameaça",
    question: "Troca de Damas: As brancas deixaram a Dama pendurada?",
    solution: ["d8h4"], hint: "Capture a Dama branca."
  },
  {
    id: 303, category: 'defense',
    fen: 'rnb1kbnr/pppp1ppp/8/4p3/4P1zq/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    white: "Peão f2", black: "Dama g4",
    question: "Proteção: O peão e4 está atacado. Defenda-o.",
    solution: ["d2d3"], hint: "Avance o peão d."
  },
  {
    id: 304, category: 'defense',
    fen: 'rnbqkbnr/pppp1ppp/8/8/4Pp2/8/PPPP2PP/RNBQKBNR w KQkq - 0 1',
    white: "Gambito Rei", black: "Aceitou",
    question: "Recuperar Material: Capture o peão f4.",
    solution: ["c1f4"], hint: "Use o Bispo."
  },
  {
    id: 305, category: 'defense',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    white: "Italiana", black: "Defesa",
    question: "Defesa dos 2 Cavalos: Desenvolva o cavalo para f6.",
    solution: ["g8f6"], hint: "Cavalo para f6."
  },
  {
    id: 306, category: 'defense',
    fen: 'rnbqkbnr/pppp1ppp/8/8/3p4/4P3/PPP2PPP/RNBQKBNR w KQkq - 0 1',
    white: "Peão d4", black: "Capturou",
    question: "Recaptura: O peão preto em d4 deve ser capturado.",
    solution: ["e3d4"], hint: "Capture com o peão."
  },
  {
    id: 307, category: 'defense',
    fen: 'rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 0 1',
    white: "Ataca f7", black: "Roque",
    question: "Segurança do Rei: Faça o Roque Pequeno.",
    solution: ["e8g8"], hint: "Rei duas casas para o lado."
  },
  {
    id: 308, category: 'defense',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 0 1',
    white: "Roque", black: "Cavalo",
    question: "Defesa do Peão e5: Ele está atacado pelo Cavalo f3. Defenda com d6.",
    solution: ["d7d6"], hint: "Avance o peão d."
  },
  {
    id: 309, category: 'defense',
    fen: 'rn1qkbnr/ppp1pppp/8/3p4/4P1b1/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    white: "Cravada", black: "Bispo g4",
    question: "Questionando o Bispo: Jogue h3.",
    solution: ["h2h3"], hint: "Avance o peão h."
  },
  {
    id: 310, category: 'defense',
    fen: 'rnbqkbnr/ppp2ppp/8/3p4/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 1',
    white: "Abertura", black: "Francesa/Caro",
    question: "Solidificando: Jogue c3 para apoiar d4.",
    solution: ["c2c3"], hint: "Peão c3."
  },
  {
    id: 311, category: 'defense',
    fen: 'rnbqkbnr/pppp1ppp/8/8/8/4p3/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    white: "Peão e3", black: "Avançado",
    question: "Bloqueio ou Captura: Capture o peão e3.",
    solution: ["d2e3"], hint: "Peão d captura." 
  },
  {
    id: 312, category: 'defense',
    fen: 'r3k2r/pppq1ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w kq - 0 1',
    white: "Meio jogo", black: "Desenvolvido",
    question: "Profilaxia: Jogue h3 para evitar Bg4.",
    solution: ["h2h3"], hint: "Pequeno avanço do peão h."
  },
  {
    id: 313, category: 'defense',
    fen: 'rnbqk2r/ppp2ppp/3p1n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1',
    white: "Italiana", black: "Sólida",
    question: "Roque: Coloque o Rei em segurança.",
    solution: ["e1g1"], hint: "O-O."
  },
  {
    id: 314, category: 'defense',
    fen: 'r1bqk1nr/pppp1ppp/2n5/2b5/2BpP3/5N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
    white: "Gambito Escocês", black: "Aceitou",
    question: "Recuperar Peão? Ou Roque? Faça o Roque.",
    solution: ["e1g1"], hint: "Segurança primeiro."
  },
  {
    id: 315, category: 'defense',
    fen: 'rnbqkbnr/pppp1ppp/8/8/4Pp2/3P4/PPP3PP/RNBQKBNR b KQkq - 0 1',
    white: "Gambito", black: "f4",
    question: "Segurar o Peão: Jogue g5 para proteger f4.",
    solution: ["g7g5"], hint: "Avance g5."
  },

  // --- ABERTURAS (Princípios) ---
  {
    id: 401, category: 'opening',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    white: "Início", black: "Início",
    question: "O Rei dos Lances: Jogue e4 (Peão do Rei).",
    solution: ["e2e4"], hint: "Controle o centro e libere o Bispo/Dama."
  },
  {
    id: 402, category: 'opening',
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    white: "Início", black: "Início",
    question: "Sólido e Clássico: Jogue d4 (Peão da Dama).",
    solution: ["d2d4"], hint: "Controle d4 e c5."
  },
  {
    id: 403, category: 'opening',
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    white: "e4", black: "Resposta",
    question: "Resposta Simétrica: Jogue e5.",
    solution: ["e7e5"], hint: "Conteste o centro."
  },
  {
    id: 404, category: 'opening',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1',
    white: "e4 e5", black: "",
    question: "Ataque o Peão: Desenvolva o Cavalo para f3.",
    solution: ["g1f3"], hint: "Cavalo f3 ataca e5."
  },
  {
    id: 405, category: 'opening',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 1',
    white: "Nf3", black: "Defesa",
    question: "Defesa Clássica: Nc6 protege o peão.",
    solution: ["b8c6"], hint: "Cavalo c6."
  },
  {
    id: 406, category: 'opening',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    white: "Italiana", black: "Vez",
    question: "Desenvolvimento do Bispo: Jogue Bc5 (Giuoco Piano).",
    solution: ["f8c5"], hint: "Bispo para c5."
  },
  {
    id: 407, category: 'opening',
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 1 2',
    white: "Ruy Lopez", black: "Vez",
    question: "Defesa Morphy: Pergunte ao bispo com a6.",
    solution: ["a7a6"], hint: "Peão a6."
  },
  {
    id: 408, category: 'opening',
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1',
    white: "Dama", black: "Escandinava?",
    question: "Gambito da Dama: Jogue c4.",
    solution: ["c2c4"], hint: "Ofereça o peão c."
  },
  {
    id: 409, category: 'opening',
    fen: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1',
    white: "Reti", black: "Resposta",
    question: "Controle Central: Jogue d5.",
    solution: ["d7d5"], hint: "Ocupe o centro."
  },
  {
    id: 410, category: 'opening',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/2N5/PPPP1PPP/R1BQKBNR b KQkq - 1 1',
    white: "Viena", black: "Resposta",
    question: "Desenvolvimento Simétrico: Nc6.",
    solution: ["b8c6"], hint: "Cavalo c6."
  },
  {
    id: 411, category: 'opening',
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    white: "e4", black: "Siciliana",
    question: "Defesa Siciliana: Jogue c5.",
    solution: ["c7c5"], hint: "Contra-ataque na ala da dama."
  },
  {
    id: 412, category: 'opening',
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    white: "e4", black: "Francesa",
    question: "Defesa Francesa: Jogue e6.",
    solution: ["e7e6"], hint: "Prepara d5."
  },
  {
    id: 413, category: 'opening',
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
    white: "e4", black: "Caro-Kann",
    question: "Defesa Caro-Kann: Jogue c6.",
    solution: ["c7c6"], hint: "Apoia d5."
  },
  {
    id: 414, category: 'opening',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 1',
    white: "Bispo", black: "Defesa",
    question: "Defesa Petroff (russo): Nf6 ataca e4.",
    solution: ["g8f6"], hint: "Cavalo f6."
  },
  {
    id: 415, category: 'opening',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 1',
    white: "Nf3", black: "Philidor",
    question: "Defesa Philidor: d6 protege e5.",
    solution: ["d7d6"], hint: "Peão d6."
  }
];

const getFenForExercise = (ex: Exercise): string => {
  if (ex.fen) return ex.fen;
  const chess = new Chess();
  chess.clear();
  // Simplified for known FENs only in this dataset, but keeping logic structure
  return chess.fen();
};

export const ExercisesView: React.FC<ExercisesViewProps> = ({ onBack }) => {
  const [viewState, setViewState] = useState<'categories' | 'list'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Game Logic State
  const [game, setGame] = useState(new Chess());
  const [boardFen, setBoardFen] = useState('start');
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed' | 'showing'>('playing');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Filter exercises
  const filteredExercises = EXERCISES_DATA.filter(ex => ex.category === selectedCategory);
  const currentEx = filteredExercises[currentIndex];

  const categories = [
    { id: 'mate', title: 'Xeque-Mate', icon: '👑', desc: 'Exercícios de finalização' },
    { id: 'tactics', title: 'Tática', icon: '⚔️', desc: 'Garfo, Cravada e Espeto' },
    { id: 'defense', title: 'Defesa', icon: '🛡️', desc: 'Saindo de situações difíceis' },
    { id: 'opening', title: 'Aberturas', icon: '📖', desc: 'Princípios iniciais' },
  ];

  // Load Exercise
  useEffect(() => {
    if (viewState === 'list' && currentEx) {
      loadExercisePosition();
    }
  }, [currentIndex, viewState, selectedCategory]);

  const loadExercisePosition = () => {
    if (!currentEx) return;
    const fen = getFenForExercise(currentEx);
    const newGame = new Chess(fen);
    
    setGame(newGame);
    setBoardFen(fen);
    setStatus('playing');
    setFeedbackMsg('');
  };

  const selectCategory = (cat: CategoryType) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setViewState('list');
  };

  const handleNext = () => {
    if (currentIndex < filteredExercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  function onDrop(sourceSquare: string, targetSquare: string) {
    if (status === 'solved' || status === 'showing') return false;

    // Check legality in chess.js
    let move = null;
    try {
      const tempGame = new Chess(game.fen());
      move = tempGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });
    } catch (e) { return false; }

    if (!move) return false;

    // Check against solution
    const userMove = sourceSquare + targetSquare;
    const expectedMove = currentEx.solution[0]; 

    if (userMove === expectedMove) {
      const newGame = new Chess(game.fen());
      newGame.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      setGame(newGame);
      setBoardFen(newGame.fen());
      setStatus('solved');
      setFeedbackMsg('🎉 Correto! Muito bem.');
      return true;
    } else {
      setStatus('failed');
      setFeedbackMsg('❌ Incorreto. Tente outra ideia.');
      return false;
    }
  }

  const showSolution = () => {
    if (!currentEx) return;
    setStatus('showing');
    
    const startFen = getFenForExercise(currentEx);
    const solGame = new Chess(startFen);
    
    const moveStr = currentEx.solution[0];
    const from = moveStr.substring(0, 2);
    const to = moveStr.substring(2, 4);
    
    solGame.move({ from, to, promotion: 'q' });
    setGame(solGame);
    setBoardFen(solGame.fen());
    setFeedbackMsg(`A solução é ${from} para ${to}.`);
    
    setTimeout(() => setStatus('solved'), 1000);
  };

  // --- VIEW: CATEGORIES ---
  if (viewState === 'categories') {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto pb-20">
        <button 
          onClick={onBack}
          className="mb-6 px-5 py-2.5 bg-slate-900/80 backdrop-blur-md rounded-full text-white font-bold transition-all shadow-lg hover:bg-slate-800 flex items-center w-fit active:scale-95 border border-white/10"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Voltar ao Menu
        </button>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-md">Treino Tático</h2>
          <p className="text-slate-200 mt-2 font-medium">Selecione uma categoria para praticar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          {categories.map(cat => (
            <div 
              key={cat.id}
              onClick={() => selectCategory(cat.id as CategoryType)}
              className="glass-panel p-8 flex items-center gap-6 cursor-pointer hover:bg-white/90 transition-all transform hover:scale-[1.02] group border-l-8 border-blue-500"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase">{cat.title}</h3>
                <p className="text-slate-500 font-medium">{cat.desc}</p>
                <span className="inline-block mt-3 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                   {EXERCISES_DATA.filter(e => e.category === cat.id).length} Exercícios
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- VIEW: EXERCISE LIST ---
  return (
    <div className="animate-fade-in pb-20 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setViewState('categories')}
          className="flex items-center px-4 py-2 bg-slate-900/80 backdrop-blur rounded-full text-white font-bold transition shadow-md hover:bg-slate-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Categorias
        </button>
        <span className="text-white/50">/</span>
        <span className="text-white font-bold uppercase tracking-wider">
          {categories.find(c => c.id === selectedCategory)?.title}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left: Exercise List */}
        <div className="w-full lg:w-1/3 bg-white/95 backdrop-blur rounded-xl shadow-xl overflow-hidden border border-slate-200 flex flex-col h-[500px]">
           <div className="p-4 bg-slate-100 border-b border-slate-200">
             <h3 className="font-bold text-slate-700 uppercase">Exercícios Disponíveis</h3>
           </div>
           <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-2">
             {filteredExercises.map((ex, idx) => (
               <button
                 key={ex.id}
                 onClick={() => { setCurrentIndex(idx); setStatus('playing'); }}
                 className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-colors border ${
                   currentIndex === idx 
                     ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                     : 'bg-white text-slate-600 border-slate-100 hover:bg-blue-50 hover:border-blue-200'
                 }`}
               >
                 <div className="flex justify-between">
                    <span className="font-bold">#{idx + 1}</span>
                    {currentIndex === idx && status === 'solved' && <span>✅</span>}
                 </div>
                 <p className="mt-1 opacity-90 truncate">{ex.question}</p>
               </button>
             ))}
             {filteredExercises.length === 0 && (
               <div className="p-4 text-center text-slate-500">
                 Nenhum exercício encontrado nesta categoria.
               </div>
             )}
           </div>
        </div>

        {/* Right: Board & Interactions */}
        <div className="flex-1 w-full flex flex-col items-center">
          
          {currentEx ? (
            <>
              {/* Info Card */}
              <div className={`w-full border-l-8 p-6 rounded-r-xl shadow-md mb-6 transition-colors bg-white ${
                  status === 'solved' ? 'border-green-500 bg-green-50' :
                  status === 'failed' ? 'border-red-500 bg-red-50' :
                  'border-blue-500'
              }`}>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Desafio #{currentEx.id}
                    </span>
                    {status === 'solved' && <span className="text-green-600 font-black uppercase text-sm">Resolvido</span>}
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-tight mb-4">
                  {currentEx.question}
                </h3>

                {/* Hints / Descriptions */}
                {status === 'playing' && (
                   <div className="text-sm text-slate-600 bg-black/5 p-3 rounded mb-4">
                     <p><strong>Dica:</strong> {currentEx.hint}</p>
                   </div>
                )}

                {/* Feedback Messages */}
                {feedbackMsg && (
                   <div className={`p-3 rounded-lg font-bold text-sm mb-4 ${
                       status === 'solved' ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'
                   }`}>
                       {feedbackMsg}
                   </div>
                )}

                {/* Actions when Failed */}
                {status === 'failed' && (
                   <div className="flex gap-3">
                       <button 
                          onClick={() => { loadExercisePosition(); }}
                          className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded hover:bg-slate-300 transition"
                       >
                          Tentar Novamente
                       </button>
                       <button 
                          onClick={showSolution}
                          className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition shadow-md"
                       >
                          👀 Ver Solução
                       </button>
                   </div>
                )}
              </div>

              {/* Board */}
              <div className="bg-white p-2 rounded-xl shadow-2xl border-4 border-slate-800 w-full max-w-[500px] aspect-square relative">
                 <Chessboard 
                    id="ExerciseBoard" 
                    position={boardFen} 
                    onPieceDrop={onDrop}
                    customBoardStyle={{ borderRadius: '4px' }}
                    arePiecesDraggable={status !== 'showing' && status !== 'solved'}
                    animationDuration={300}
                 />
              </div>

              {/* Navigation */}
              <div className="flex gap-4 mt-6 w-full max-w-[500px]">
                 <button 
                   onClick={handlePrev}
                   disabled={currentIndex === 0}
                   className="flex-1 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                 >
                   ⬅ Anterior
                 </button>
                 <button 
                   onClick={handleNext}
                   disabled={currentIndex === filteredExercises.length - 1}
                   className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                 >
                   Próximo ➡
                 </button>
              </div>
            </>
          ) : (
             <div className="text-white font-bold text-xl">Selecione um exercício ao lado.</div>
          )}
        </div>
      </div>
    </div>
  );
};