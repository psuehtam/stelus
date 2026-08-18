import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcularValorServico,
  calcularUnitarioPeca,
  aplicarMinimoUnitario,
  definirCategoriaAutomatica,
  resolverCategoriaFechamento,
  MINIMO_UNITARIO_PECA,
} from './precificacaoService.js';

test('calcularValorServico — fórmula básica', () => {
  const valor = calcularValorServico(5000, 100, 12.5);
  assert.equal(valor, 6250);
});

test('calcularValorServico — matriz pequena', () => {
  const valor = calcularValorServico(1200, 30, 8);
  assert.equal(valor, 288);
});

test('definirCategoriaAutomatica — exatamente no limite', () => {
  assert.equal(definirCategoriaAutomatica(50, 50), 'producao');
});

test('definirCategoriaAutomatica — abaixo do limite', () => {
  assert.equal(definirCategoriaAutomatica(49, 50), 'nao_producao');
});

test('definirCategoriaAutomatica — acima do limite', () => {
  assert.equal(definirCategoriaAutomatica(100, 50), 'producao');
});

test('definirCategoriaAutomatica — limite customizado por cliente', () => {
  assert.equal(definirCategoriaAutomatica(30, 30), 'producao');
  assert.equal(definirCategoriaAutomatica(29, 30), 'nao_producao');
});

test('resolverCategoriaFechamento — usa total do período, ignora categoria automática antiga', () => {
  const r = resolverCategoriaFechamento(50, 50, 'nao_producao', false);
  assert.equal(r.categoria, 'producao');
  assert.equal(r.automatica, true);
});

test('calcularUnitarioPeca — pontos × R$/mil', () => {
  assert.equal(calcularUnitarioPeca(8200, 8.5), 69.7);
  assert.equal(calcularUnitarioPeca(4500, 10), 45);
});

test('calcularUnitarioPeca — arredonda imprecisão de ponto flutuante', () => {
  assert.equal(calcularUnitarioPeca(2880, 0.5), 1.44);
});

test('aplicarMinimoUnitario — sobe para R$ 2 quando calculado é menor', () => {
  const r = aplicarMinimoUnitario(1200, 1);
  assert.equal(r.valorUnitario, MINIMO_UNITARIO_PECA);
  assert.equal(r.minimoAplicado, true);
});

test('aplicarMinimoUnitario — respeita override manual abaixo do mínimo', () => {
  const r = aplicarMinimoUnitario(1200, 8, { permitirAbaixo: true });
  assert.equal(r.valorUnitario, 9.6);
  assert.equal(r.minimoAplicado, false);
});

test('aplicarMinimoUnitario — não reaplica mínimo em preço salvo abaixo de R$ 2', () => {
  // 1600 pts, R$/mil 0,7813 → unitário 1,25 (fechamento anterior)
  const r = aplicarMinimoUnitario(1600, 0.7813, { permitirAbaixo: true });
  assert.equal(r.valorUnitario, 1.25);
  assert.equal(r.minimoAplicado, false);
});

test('aplicarMinimoUnitario — não altera quando já acima do mínimo', () => {
  const r = aplicarMinimoUnitario(4500, 10);
  assert.equal(r.valorUnitario, 45);
  assert.equal(r.minimoAplicado, false);
});

test('resolverCategoriaFechamento — respeita override manual do admin', () => {
  const r = resolverCategoriaFechamento(50, 50, 'nao_producao', true);
  assert.equal(r.categoria, 'nao_producao');
  assert.equal(r.automatica, false);
});
