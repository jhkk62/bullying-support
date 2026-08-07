// src/utils/moderacao.js
const PADROES_GRAVES = [
  /vou\s*te\s*matar/i,
  /vou\s*te\s*encontrar\s*e/i,
  /vou\s*te\s*bater/i,
  /devia(m)?\s*morrer/i,
  /se\s*mata/i,
];

const PADROES_MODERADOS = [
  /\bidiota\b/i,
  /\bimbecil\b/i,
  /\bburr[oa]\b/i,
  /\bin[uú]til\b/i,
  /\bvagabund[oa]\b/i,
  /filh[oa]\s*da\s*puta/i,
];

const PADROES_AUTOLESAO = [
  /me\s*matar/i,
  /quero\s*morrer/i,
  /quero\s*sumir/i,
];

export function analisarTexto(texto, tipo = "post") {
  const normalizado = texto.toLowerCase();
  
  // Ameaça grave: SEMPRE bane (posts ou comentários)
  if (PADROES_GRAVES.some((p) => p.test(normalizado))) return "grave";
  
  // Automutilação: nunca bane (mostra apoio)
  if (PADROES_AUTOLESAO.some((p) => p.test(normalizado))) return "autolesao";
  
  // Xingamento moderado: só bane em COMENTÁRIOS
  if (PADROES_MODERADOS.some((p) => p.test(normalizado))) {
    return tipo === "comentario" ? "moderado" : "sinalizado";
  }
  
  return "ok";
}