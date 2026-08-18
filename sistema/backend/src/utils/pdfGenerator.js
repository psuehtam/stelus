import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { arredondarMoeda } from './money.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../../generated');
const LOGO_PATH = path.join(__dirname, '../assets/logo-stelus-icon.png');

const MARGIN = 35;
const CONTENT_W = 525;
const SECTION = '#6B6B6B';
const SECTION_BG = '#E8E8E8';
const BORDER = '#BBBBBB';
const TEXT = '#000000';
const TEXT_MUTED = '#444444';

function textColor(doc, color = TEXT) {
  doc.fillColor(color);
}

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatCurrencyPlain(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('pt-BR');
}

function formatDateTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function formatQuantity(qty) {
  return Number(qty).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function formatDoc(doc) {
  if (!doc) return '';
  const d = String(doc).replace(/\D/g, '');
  if (d.length === 14) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  }
  if (d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  return doc;
}

function formatCep(cep) {
  if (!cep) return '';
  const d = String(cep).replace(/\D/g, '');
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : cep;
}

function montarDescricao(item) {
  const nome = item.matrizNome ?? item.matriz_nome ?? '';
  const parte = item.partePecaNome ?? item.parte_peca_nome ?? '';
  return `BORD ${nome} ${parte}`.trim().toUpperCase();
}

function enderecoEmpresa(config) {
  const partes = [];
  if (config?.endereco) {
    let linha = config.endereco;
    if (config.numero) linha += `, ${config.numero}`;
    if (config.bairro) linha += ` — ${config.bairro}`;
    partes.push(linha);
  }
  const loc = [config?.cep ? `CEP ${formatCep(config.cep)}` : null, config?.cidade, config?.estado || null]
    .filter(Boolean)
    .join(' - ');
  if (loc) partes.push(loc);
  return partes.join(', ');
}

function enderecoCliente(cliente) {
  const partes = [];
  if (cliente?.endereco) {
    let linha = cliente.endereco;
    if (cliente.numero) linha += `, ${cliente.numero}`;
    if (cliente.bairro) linha += ` — ${cliente.bairro}`;
    partes.push(linha);
  }
  const loc = [cliente?.cep ? `CEP ${formatCep(cliente.cep)}` : null, cliente?.cidade, cliente?.estado || null]
    .filter(Boolean)
    .join(' - ');
  if (loc) partes.push(loc);
  return partes.join('\n');
}

function labelDocumentoCliente(cliente) {
  const tipo = cliente?.tipoPessoa ?? cliente?.tipo_pessoa;
  if (tipo === 'fisica') return 'CPF';
  if (tipo === 'juridica') return 'CNPJ';
  const d = String(cliente?.documento ?? '').replace(/\D/g, '');
  if (d.length === 11) return 'CPF';
  if (d.length === 14) return 'CNPJ';
  return 'CPF/CNPJ';
}

function drawSectionBar(doc, title, y) {
  doc.fillColor(SECTION).rect(MARGIN, y, 6, 18).fill();
  doc.fillColor(SECTION_BG).rect(MARGIN + 6, y, CONTENT_W - 6, 18).fill();
  textColor(doc);
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text(title, MARGIN + 12, y + 5);
  return y + 22;
}

function drawFieldRow(doc, fields, y) {
  const colW = CONTENT_W / fields.length;
  fields.forEach((f, i) => {
    const x = MARGIN + i * colW;
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#333333');
    doc.text(f.label, x + 4, y, { width: colW - 8, lineBreak: false });
    doc.font('Helvetica').fontSize(8).fillColor('#000000');
    doc.text(f.value ?? '—', x + 4, y + 10, { width: colW - 8, lineBreak: false });
  });
  return y + 28;
}

function pageMaxY(doc) {
  return doc.page.height - MARGIN;
}

function ensureSpace(doc, y, needed, redrawPageHeader) {
  if (y + needed <= pageMaxY(doc)) return y;
  doc.addPage({ margin: MARGIN, size: 'A4' });
  return redrawPageHeader ? redrawPageHeader() : MARGIN;
}

export async function gerarPdfFechamento(fechamento, cliente, config, itens, extras = {}) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const filename = `pedido-${fechamento.id}-${Date.now()}.pdf`;
  const filepath = path.join(OUTPUT_DIR, filename);

  const agora = new Date();
  const dataEmissao = agora;
  const dataEntrega = new Date(agora);
  dataEntrega.setDate(dataEntrega.getDate() + 30);

  const totalPecas = itens.reduce((s, i) => s + Number(i.quantidade), 0);
  const valorTotal = Number(fechamento.valorTotal ?? fechamento.valor_total);
  const pagamentos = extras.pagamentos ?? [];
  const totalPago = pagamentos.reduce((s, p) => s + Number(p.valorPago ?? p.valor_pago), 0);
  const saldo = valorTotal - totalPago;

  const cols = {
    ref: 68,
    desc: 162,
    un: 44,
    qtd: 50,
    unit: 62,
    descnt: 50,
    total: 59,
  };
  const ITEM_HEADER_H = 20;
  const ITEM_ROW_H = 16;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'A4' });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    function drawCompanyHeader(yStart = MARGIN) {
      const logoSize = 48;
      if (fs.existsSync(LOGO_PATH)) {
        doc.image(LOGO_PATH, MARGIN, yStart, { width: logoSize, height: logoSize });
      }

      const textX = MARGIN + logoSize + 12;
      const textW = CONTENT_W - logoSize - 12;

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#4D5373');
      const razao = config?.razaoSocial ?? config?.nomeEmpresa ?? 'Stelus Bordados';
      doc.text(razao.toUpperCase(), textX, yStart, { width: textW, align: 'right' });
      doc.font('Helvetica').fontSize(8).fillColor('#000000');
      if (config?.cnpj) {
        doc.text(`CNPJ ${formatDoc(config.cnpj)}`, textX, yStart + 14, { width: textW, align: 'right', lineBreak: false });
      }
      const endEmp = enderecoEmpresa(config);
      if (endEmp) doc.text(endEmp, textX, yStart + 26, { width: textW, align: 'right', lineBreak: false });
      if (config?.telefone) {
        doc.text(String(config.telefone), textX, yStart + 38, { width: textW, align: 'right', lineBreak: false });
      }
      return yStart + logoSize + 8;
    }

    function drawItemsTableHeader(y) {
      doc.strokeColor(BORDER).rect(MARGIN, y, CONTENT_W, ITEM_HEADER_H).stroke();
      textColor(doc);
      doc.font('Helvetica-Bold').fontSize(6.5);
      let x = MARGIN + 3;
      const headers = [
        ['Referência', cols.ref],
        ['Descrição', cols.desc],
        ['Unidade', cols.un],
        ['Quantidade', cols.qtd],
        ['Unitário', cols.unit],
        ['Desconto', cols.descnt],
        ['Total', cols.total],
      ];
      headers.forEach(([h, w]) => {
        doc.text(h, x, y + 6, { width: w - 4, lineBreak: false });
        x += w;
      });
      return y + ITEM_HEADER_H;
    }

    let y = drawCompanyHeader();

    y = drawSectionBar(doc, 'PEDIDO DE VENDA', y + 4);
    doc.strokeColor(BORDER).rect(MARGIN, y, CONTENT_W, 104).stroke(BORDER);
    y += 6;
    y = drawFieldRow(doc, [
      { label: 'Pedido', value: String(fechamento.id) },
      { label: 'Vendedor', value: extras.vendedor ?? '—' },
      { label: 'Cliente', value: cliente.nome },
    ], y);
    y = drawFieldRow(doc, [
      { label: 'Razão social', value: cliente.razaoSocial ?? cliente.razao_social ?? '—' },
      { label: labelDocumentoCliente(cliente), value: formatDoc(cliente.documento) || '—' },
      { label: 'Telefone', value: cliente.telefone ?? '—' },
    ], y);
    y = drawFieldRow(doc, [
      { label: 'E-mail', value: cliente.email ?? '—' },
      { label: 'Data de criação', value: formatDate(fechamento.criadoEm ?? fechamento.criado_em) },
      { label: 'Data de emissão', value: formatDate(dataEmissao) },
    ], y);
    y = drawFieldRow(doc, [
      { label: 'Data de entrega', value: formatDate(dataEntrega) },
      {
        label: 'Período dos serviços',
        value: `${formatDate(fechamento.periodoInicio ?? fechamento.periodo_inicio)} a ${formatDate(fechamento.periodoFim ?? fechamento.periodo_fim)}`,
      },
      { label: '', value: '' },
    ], y);
    y += 4;

    const endCobranca = enderecoCliente(cliente);
    const endH = endCobranca.trim() ? 44 : 22;
    y = drawSectionBar(doc, 'ENDEREÇO DE COBRANÇA', y + 4);
    doc.strokeColor(BORDER).rect(MARGIN, y, CONTENT_W, endH).stroke(BORDER);
    doc.font('Helvetica').fontSize(8);
    textColor(doc);
    doc.text(endCobranca.trim() || '—', MARGIN + 6, y + 6, { width: CONTENT_W - 12, lineBreak: true });
    y += endH + 6;

    y = drawSectionBar(doc, 'ITENS DO PEDIDO', y + 4);
    y = drawItemsTableHeader(y);

    doc.font('Helvetica').fontSize(7);
    textColor(doc);

    for (const item of itens) {
      y = ensureSpace(doc, y, ITEM_ROW_H, () => {
        let ny = MARGIN;
        ny = drawSectionBar(doc, 'ITENS DO PEDIDO (continuação)', ny);
        return drawItemsTableHeader(ny);
      });

      const ref = item.matrizReferencia ?? item.matriz_referencia ?? '—';
      const desc = montarDescricao(item);
      const valorMil = item.valorPorMil ?? item.valor_por_mil;
      const valorLinha = item.valorCalculado ?? item.valor_calculado;
      const qtdPontos = item.qtdPontos ?? item.qtd_pontos ?? 0;
      const unitario = arredondarMoeda((qtdPontos / 1000) * Number(valorMil));

      doc.strokeColor(BORDER).rect(MARGIN, y, CONTENT_W, ITEM_ROW_H).stroke();
      textColor(doc);
      let x = MARGIN + 3;
      const cells = [
        [String(ref), cols.ref],
        [desc.length > 38 ? `${desc.slice(0, 37)}…` : desc, cols.desc],
        ['Unidade', cols.un],
        [formatQuantity(item.quantidade), cols.qtd],
        [formatCurrency(unitario), cols.unit],
        [formatCurrency(0), cols.descnt],
        [formatCurrency(valorLinha), cols.total],
      ];
      cells.forEach(([text, w]) => {
        doc.text(String(text), x, y + 4, { width: w - 4, lineBreak: false });
        x += w;
      });
      y += ITEM_ROW_H;
    }

    y += 10;

    doc.font('Helvetica-Bold').fontSize(8);
    textColor(doc);
    doc.text(`Pedido: ${fechamento.id}`, MARGIN, y, { lineBreak: false });
    y += 14;

    doc.strokeColor(BORDER).rect(MARGIN + 280, y, 245, 36).stroke();
    doc.font('Helvetica').fontSize(8);
    textColor(doc);
    doc.text(`Quantidade de Itens: ${formatQuantity(totalPecas)}`, MARGIN + 288, y + 6, { lineBreak: false });
    doc.text(`Valor total dos itens: ${formatCurrency(valorTotal)}`, MARGIN + 288, y + 20, { lineBreak: false });

    y += 48;
    doc.font('Helvetica-Bold').fontSize(8);
    textColor(doc);
    doc.text('Valor Total de Pedido', MARGIN, y, { lineBreak: false });
    y += 12;

    const totCols = [120, 80, 80, 80, 125];
    doc.fillColor(SECTION_BG).rect(MARGIN, y, CONTENT_W, 16).fill();
    doc.strokeColor(BORDER).rect(MARGIN, y, CONTENT_W, 16).stroke();
    textColor(doc);
    doc.font('Helvetica-Bold').fontSize(7);
    let tx = MARGIN + 4;
    ['Total dos Itens', 'Desconto', 'Frete', 'Outros', 'Valor Total'].forEach((h, i) => {
      doc.text(h, tx, y + 4, { width: totCols[i] - 4, lineBreak: false });
      tx += totCols[i];
    });
    y += 16;
    doc.strokeColor(BORDER).rect(MARGIN, y, CONTENT_W, 18).stroke();
    textColor(doc);
    tx = MARGIN + 4;
    [
      formatCurrency(valorTotal),
      formatCurrency(0),
      formatCurrency(0),
      formatCurrency(0),
      formatCurrency(valorTotal),
    ].forEach((v, i) => {
      doc.font(i === 4 ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
      textColor(doc);
      doc.text(v, tx, y + 5, { width: totCols[i] - 4, lineBreak: false });
      tx += totCols[i];
    });
    y += 28;

    y = drawSectionBar(doc, 'FORMA / CONDIÇÕES DE PAGAMENTO', y);
    const payCols = [130, 70, 70, 70, 60, 125];
    doc.strokeColor(BORDER).rect(MARGIN, y, CONTENT_W, 14).stroke();
    textColor(doc);
    doc.font('Helvetica-Bold').fontSize(7);
    tx = MARGIN + 3;
    ['Descrição', 'Vencimento', 'Pagamento', 'Valor', 'Saldo', 'Observação'].forEach((h, i) => {
      doc.text(h, tx, y + 3, { width: payCols[i] - 4, lineBreak: false });
      tx += payCols[i];
    });
    y += 14;

    if (pagamentos.length === 0) {
      doc.strokeColor(BORDER).rect(MARGIN, y, CONTENT_W, 14).stroke();
      tx = MARGIN + 3;
      const venc = config?.prazoPagamento ?? formatDate(dataEmissao);
      const row = [
        'A combinar',
        venc,
        '—',
        formatCurrencyPlain(valorTotal),
        formatCurrencyPlain(saldo),
        '',
      ];
      doc.font('Helvetica').fontSize(7);
      textColor(doc);
      row.forEach((cell, i) => {
        doc.text(String(cell), tx, y + 3, { width: payCols[i] - 4, lineBreak: false });
        tx += payCols[i];
      });
      y += 14;
    } else {
      for (const p of pagamentos) {
        doc.strokeColor(BORDER).rect(MARGIN, y, CONTENT_W, 14).stroke();
        tx = MARGIN + 3;
        const row = [
          p.formaPagamento ?? p.forma_pagamento ?? '—',
          formatDate(p.dataPagamento ?? p.data_pagamento),
          formatDate(p.dataPagamento ?? p.data_pagamento),
          formatCurrencyPlain(p.valorPago ?? p.valor_pago),
          formatCurrencyPlain(saldo),
          p.observacao ?? '',
        ];
        doc.font('Helvetica').fontSize(7);
        textColor(doc);
        row.forEach((cell, i) => {
          doc.text(String(cell), tx, y + 3, { width: payCols[i] - 4, lineBreak: false });
          tx += payCols[i];
        });
        y += 14;
      }
    }

    y += 8;
    y = ensureSpace(doc, y, 120);
    y = drawSectionBar(doc, 'OBSERVAÇÕES', y);
    doc.strokeColor(BORDER).rect(MARGIN, y, CONTENT_W, 50).stroke(BORDER);
    const obs = [config?.observacoesPadrao, config?.mensagemCobranca].filter(Boolean).join('\n');
    doc.font('Helvetica').fontSize(8);
    textColor(doc);
    if (obs) {
      doc.text(obs, MARGIN + 6, y + 6, { width: CONTENT_W - 12, height: 44, lineBreak: true });
    }
    y += 58;

    y += 12;
    const sigY = y + 18;
    doc.strokeColor(BORDER).moveTo(MARGIN + 20, sigY).lineTo(MARGIN + 220, sigY).stroke();
    doc.moveTo(MARGIN + 290, sigY).lineTo(MARGIN + 490, sigY).stroke();
    doc.font('Helvetica').fontSize(8);
    textColor(doc);
    doc.text('Assinatura do Comprador', MARGIN + 20, sigY + 6, { width: 200, align: 'center', lineBreak: false });
    doc.text('Assinatura do Recebedor', MARGIN + 290, sigY + 6, { width: 200, align: 'center', lineBreak: false });
    y = sigY + 28;

    doc.fontSize(7).fillColor(TEXT_MUTED);
    doc.text('Stelus Bordados — Sistema de Gestão', MARGIN, y, { lineBreak: false, width: CONTENT_W / 2 });
    doc.text(`Impresso em: ${formatDateTime(agora)}`, MARGIN, y, { lineBreak: false, width: CONTENT_W, align: 'right' });

    doc.y = y + 12;

    doc.end();
    stream.on('finish', () => resolve({ filename, filepath: `/generated/${filename}` }));
    stream.on('error', reject);
  });
}

function formatDateLong(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(`${String(dateStr).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  const raw = d.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function tipoPecaLabel(tipo) {
  return tipo === 'fechada' ? 'Fechada' : 'Aberta';
}

function agruparPorDia(servicos) {
  const map = new Map();
  for (const s of servicos) {
    const dia = String(s.dataServico ?? s.data_servico ?? '').slice(0, 10);
    if (!map.has(dia)) map.set(dia, []);
    map.get(dia).push(s);
  }
  return Array.from(map.entries()).map(([data, itens]) => ({ data, itens }));
}

export function gerarPdfRelatorioOperacional(servicos, config, { dataInicio, dataFim } = {}) {
  const doc = new PDFDocument({ margin: MARGIN, size: 'A4' });
  const agora = new Date();
  const dias = agruparPorDia(servicos);

  const cols = { cliente: 115, matriz: 115, parte: 70, tipo: 55, qtd: 45, func: 125 };
  const ROW_H = 16;
  const HEADER_H = 18;

  function drawCompanyHeader(yStart = MARGIN) {
    const logoSize = 44;
    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, MARGIN, yStart, { width: logoSize, height: logoSize });
    }
    const textX = MARGIN + logoSize + 10;
    const textW = CONTENT_W - logoSize - 10;
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#4D5373');
    const razao = config?.razaoSocial ?? config?.nomeEmpresa ?? 'Stelus Bordados';
    doc.text(razao.toUpperCase(), textX, yStart, { width: textW, align: 'right' });
    doc.font('Helvetica').fontSize(8).fillColor(TEXT_MUTED);
    doc.text('Relatório operacional de lançamentos', textX, yStart + 14, { width: textW, align: 'right', lineBreak: false });
    const periodo = dataInicio && dataFim
      ? `Período: ${formatDate(dataInicio)} a ${formatDate(dataFim)}`
      : 'Período: todos os lançamentos';
    doc.text(periodo, textX, yStart + 26, { width: textW, align: 'right', lineBreak: false });
    return yStart + logoSize + 10;
  }

  function drawTableHeader(y) {
    doc.fillColor(SECTION_BG).rect(MARGIN, y, CONTENT_W, HEADER_H).fill();
    doc.strokeColor(BORDER).rect(MARGIN, y, CONTENT_W, HEADER_H).stroke();
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#333333');
    let x = MARGIN;
    const headers = [
      ['Cliente', cols.cliente],
      ['Matriz', cols.matriz],
      ['Parte', cols.parte],
      ['Tipo', cols.tipo],
      ['Qtd', cols.qtd],
      ['Funcionário', cols.func],
    ];
    headers.forEach(([label, w]) => {
      doc.text(label, x + 4, y + 5, { width: w - 8, lineBreak: false });
      x += w;
    });
    return y + HEADER_H;
  }

  function drawRow(y, s) {
    doc.strokeColor(BORDER).moveTo(MARGIN, y + ROW_H).lineTo(MARGIN + CONTENT_W, y + ROW_H).stroke();
    doc.font('Helvetica').fontSize(7.5).fillColor(TEXT);
    let x = MARGIN;
    const cells = [
      [s.cliente?.nome ?? s.cliente_nome ?? '—', cols.cliente],
      [s.matriz?.nome ?? s.matriz_nome ?? '—', cols.matriz],
      [s.partePeca?.nome ?? s.parte_peca_nome ?? '—', cols.parte],
      [tipoPecaLabel(s.tipoPeca ?? s.tipo_peca), cols.tipo],
      [String(s.quantidade), cols.qtd],
      [s.usuario?.nome ?? s.usuario_nome ?? '—', cols.func],
    ];
    cells.forEach(([val, w]) => {
      doc.text(String(val), x + 4, y + 4, { width: w - 8, lineBreak: false });
      x += w;
    });
    return y + ROW_H;
  }

  let y = drawCompanyHeader();
  y += 6;

  if (dias.length === 0) {
    doc.font('Helvetica').fontSize(10).fillColor(TEXT_MUTED);
    doc.text('Nenhum lançamento encontrado no período selecionado.', MARGIN, y);
    doc.end();
    return doc;
  }

  let totalPecas = 0;
  let totalLancamentos = 0;

  for (const { data, itens } of dias) {
    const qtdDia = itens.reduce((s, i) => s + Number(i.quantidade), 0);
    totalPecas += qtdDia;
    totalLancamentos += itens.length;

    const blocoH = 22 + HEADER_H + itens.length * ROW_H + 18;
    y = ensureSpace(doc, y, blocoH, () => {
      y = drawCompanyHeader();
      return y + 6;
    });

    y = drawSectionBar(doc, formatDateLong(data), y);
    y = drawTableHeader(y);
    for (const s of itens) {
      y = ensureSpace(doc, y, ROW_H + 4, () => {
        y = drawCompanyHeader();
        y += 6;
        y = drawSectionBar(doc, `${formatDateLong(data)} (continuação)`, y);
        y = drawTableHeader(y);
        return y;
      });
      y = drawRow(y, s);
    }

    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(TEXT_MUTED);
    doc.text(
      `Total do dia: ${qtdDia.toLocaleString('pt-BR')} peça(s) · ${itens.length} lançamento(s)`,
      MARGIN,
      y + 4,
      { width: CONTENT_W, lineBreak: false },
    );
    y += 22;
  }

  y = ensureSpace(doc, y, 40);
  doc.strokeColor(BORDER).moveTo(MARGIN, y).lineTo(MARGIN + CONTENT_W, y).stroke();
  y += 8;
  doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT);
  doc.text(
    `Resumo: ${totalLancamentos} lançamento(s) · ${totalPecas.toLocaleString('pt-BR')} peça(s) · ${dias.length} dia(s)`,
    MARGIN,
    y,
    { width: CONTENT_W, lineBreak: false },
  );
  y += 20;

  doc.fontSize(7).fillColor(TEXT_MUTED);
  doc.text('Stelus Bordados — Sistema de Gestão', MARGIN, y, { lineBreak: false, width: CONTENT_W / 2 });
  doc.text(`Impresso em: ${formatDateTime(agora)}`, MARGIN, y, { lineBreak: false, width: CONTENT_W, align: 'right' });

  doc.end();
  return doc;
}
