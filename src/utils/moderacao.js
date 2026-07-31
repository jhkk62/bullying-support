// src/utils/moderacao.js

// Ameaças/ataques diretos a uma pessoa -> "grave" (bane 24h)
const PADROES_GRAVES = [
  /vou\s*te\s*matar/i,
  /vou\s*te\s*encontrar\s*e/i,
  /vou\s*te\s*bater/i,
  /devia(m)?\s*morrer/i,
];

// Xingamentos/insultos sem ameaça de violência -> "moderado" (bane 2min)
const PADROES_MODERADOS = [
  /\bidiota\b/i,
  /\bimbecil\b/i,
  /\bburr[oa]\b/i,
  /\bin[uú]til\b/i,
  /\bvagabund[oa]\b/i,
  /filh[oa]\s*da\s*puta/i,
];

// Menção a automutilação/suicídio -> "autolesao" (NÃO bane, mostra apoio)
const PADROES_AUTOLESAO = [
  /se\s*mat[ae]\b/i,
  /v[aá]\s*se\s*matar/i,
  /me\s*matar/i,
  /quero\s*morrer/i,
  /quero\s*sumir/i,
];

export function analisarTexto(texto) {
  const normalizado = texto.toLowerCase();
  if (PADROES_AUTOLESAO.some((p) => p.test(normalizado))) return "autolesao";
  if (PADROES_GRAVES.some((p) => p.test(normalizado))) return "grave";
  if (PADROES_MODERADOS.some((p) => p.test(normalizado))) return "moderado";
  return "ok";
}