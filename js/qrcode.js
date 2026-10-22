/*!
 * Fatos.online · qrcode.js
 * Gerador de QR Code nativo (ISO/IEC 18004), sem dependências externas.
 * Modo byte (UTF-8) · correção L/M/Q/H · versões 1–40 · escolha automática de máscara.
 *
 * Autoria: equipe acadêmica Fatos.online — https://github.com/briandevbr/fatos.online
 * Licença: Apache-2.0
 */
(function (root) {
  'use strict';

  // Índice nas tabelas e bits de formato de cada nível de correção (definidos pela norma).
  const ECL = {
    L: { name: 'L', ordinal: 0, formatBits: 1 },
    M: { name: 'M', ordinal: 1, formatBits: 0 },
    Q: { name: 'Q', ordinal: 2, formatBits: 3 },
    H: { name: 'H', ordinal: 3, formatBits: 2 },
  };

  // Codewords de correção por bloco, por nível (linha) e versão (coluna; índice 0 não é usado).
  const ECC_PER_BLOCK = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  ];

  // Quantidade de blocos de correção, mesma organização da tabela acima.
  const NUM_BLOCKS = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
  ];

  const getBit = (value, index) => ((value >>> index) & 1) !== 0;

  // Módulos disponíveis para dados + correção, descontando os padrões de função.
  function rawDataModules(version) {
    let result = (16 * version + 128) * version + 64;
    if (version >= 2) {
      const numAlign = Math.floor(version / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (version >= 7) result -= 36;
    }
    return result;
  }

  function dataCodewords(version, ecl) {
    return (
      Math.floor(rawDataModules(version) / 8) -
      ECC_PER_BLOCK[ecl.ordinal][version] * NUM_BLOCKS[ecl.ordinal][version]
    );
  }

  // Multiplicação em GF(2^8) com o polinômio primitivo 0x11D.
  function gfMultiply(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }

  // Polinômio gerador de Reed–Solomon (sem o termo de maior grau, que é sempre 1).
  function rsDivisor(degree) {
    const result = new Array(degree).fill(0);
    result[degree - 1] = 1;
    let rootValue = 1;
    for (let i = 0; i < degree; i++) {
      for (let j = 0; j < result.length; j++) {
        result[j] = gfMultiply(result[j], rootValue);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      rootValue = gfMultiply(rootValue, 0x02);
    }
    return result;
  }

  function rsRemainder(data, divisor) {
    const result = divisor.map(() => 0);
    for (const byte of data) {
      const factor = byte ^ result.shift();
      result.push(0);
      divisor.forEach((coef, i) => {
        result[i] ^= gfMultiply(coef, factor);
      });
    }
    return result;
  }

  // Divide os dados em blocos, calcula a correção de cada um e intercala tudo.
  function addEccAndInterleave(data, version, ecl) {
    const numBlocks = NUM_BLOCKS[ecl.ordinal][version];
    const blockEccLen = ECC_PER_BLOCK[ecl.ordinal][version];
    const rawCodewords = Math.floor(rawDataModules(version) / 8);
    const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);
    const divisor = rsDivisor(blockEccLen);

    const blocks = [];
    for (let i = 0, k = 0; i < numBlocks; i++) {
      const block = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
      k += block.length;
      const ecc = rsRemainder(block, divisor);
      if (i < numShortBlocks) block.push(0);
      blocks.push(block.concat(ecc));
    }

    const result = [];
    for (let i = 0; i < blocks[0].length; i++) {
      blocks.forEach((block, j) => {
        // O byte de preenchimento dos blocos curtos não entra na sequência final.
        if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i]);
      });
    }
    return result;
  }

  function alignmentPositions(version, size) {
    if (version === 1) return [];
    const numAlign = Math.floor(version / 7) + 2;
    const step = Math.floor((version * 8 + numAlign * 3 + 5) / (numAlign * 4 - 4)) * 2;
    const result = [6];
    for (let pos = size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
    return result;
  }

  // Conta padrões 1:1:3:1:1 (parecidos com o localizador) com 4 módulos claros de um dos lados.
  function finderLikeCount(line) {
    const n = line.length;
    const at = (i) => i >= 0 && i < n && line[i];
    let count = 0;
    for (let i = 0; i + 7 <= n; i++) {
      if (at(i) && !at(i + 1) && at(i + 2) && at(i + 3) && at(i + 4) && !at(i + 5) && at(i + 6)) {
        const lightBefore = !at(i - 1) && !at(i - 2) && !at(i - 3) && !at(i - 4);
        const lightAfter = !at(i + 7) && !at(i + 8) && !at(i + 9) && !at(i + 10);
        if (lightBefore || lightAfter) count++;
      }
    }
    return count;
  }

  // Penalidades N1–N4 da norma: a máscara com menor pontuação é a mais legível.
  function penaltyScore(modules) {
    const size = modules.length;
    let result = 0;

    for (let pass = 0; pass < 2; pass++) {
      for (let a = 0; a < size; a++) {
        const line = [];
        let runColor = null;
        let runLength = 0;
        for (let b = 0; b < size; b++) {
          const dark = pass === 0 ? modules[a][b] : modules[b][a];
          line.push(dark);
          if (dark === runColor) {
            runLength++;
            if (runLength === 5) result += 3;
            else if (runLength > 5) result += 1;
          } else {
            runColor = dark;
            runLength = 1;
          }
        }
        result += 40 * finderLikeCount(line);
      }
    }

    for (let y = 0; y < size - 1; y++) {
      for (let x = 0; x < size - 1; x++) {
        const c = modules[y][x];
        if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) result += 3;
      }
    }

    let dark = 0;
    modules.forEach((row) => row.forEach((cell) => { if (cell) dark++; }));
    const total = size * size;
    result += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
    return result;
  }

  function buildMatrix(version, ecl, codewords, forcedMask) {
    const size = version * 4 + 17;
    const modules = Array.from({ length: size }, () => new Array(size).fill(false));
    const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));
    const setFunction = (x, y, dark) => {
      modules[y][x] = dark;
      isFunction[y][x] = true;
    };

    // Padrões de temporização.
    for (let i = 0; i < size; i++) {
      setFunction(6, i, i % 2 === 0);
      setFunction(i, 6, i % 2 === 0);
    }

    // Três localizadores (com separadores) nos cantos.
    const drawFinder = (cx, cy) => {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          const x = cx + dx;
          const y = cy + dy;
          if (x >= 0 && x < size && y >= 0 && y < size) setFunction(x, y, dist !== 2 && dist !== 4);
        }
      }
    };
    drawFinder(3, 3);
    drawFinder(size - 4, 3);
    drawFinder(3, size - 4);

    // Padrões de alinhamento (exceto onde coincidem com os localizadores).
    const positions = alignmentPositions(version, size);
    const n = positions.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            setFunction(positions[i] + dx, positions[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
          }
        }
      }
    }

    // Informação de formato (nível + máscara) com BCH(15,5), em duas cópias.
    const drawFormat = (mask) => {
      const data = (ecl.formatBits << 3) | mask;
      let rem = data;
      for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      const bits = ((data << 10) | rem) ^ 0x5412;

      for (let i = 0; i <= 5; i++) setFunction(8, i, getBit(bits, i));
      setFunction(8, 7, getBit(bits, 6));
      setFunction(8, 8, getBit(bits, 7));
      setFunction(7, 8, getBit(bits, 8));
      for (let i = 9; i < 15; i++) setFunction(14 - i, 8, getBit(bits, i));

      for (let i = 0; i < 8; i++) setFunction(size - 1 - i, 8, getBit(bits, i));
      for (let i = 8; i < 15; i++) setFunction(8, size - 15 + i, getBit(bits, i));
      setFunction(8, size - 8, true);
    };
    drawFormat(0);

    // Informação de versão com BCH(18,6), apenas a partir da versão 7.
    if (version >= 7) {
      let rem = version;
      for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      const bits = (version << 12) | rem;
      for (let i = 0; i < 18; i++) {
        const dark = getBit(bits, i);
        const a = size - 11 + (i % 3);
        const b = Math.floor(i / 3);
        setFunction(a, b, dark);
        setFunction(b, a, dark);
      }
    }

    // Posiciona os codewords em zigue-zague, de baixo para cima, em colunas de 2.
    const allCodewords = addEccAndInterleave(codewords, version, ecl);
    let bitIndex = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vert : vert;
          if (!isFunction[y][x] && bitIndex < allCodewords.length * 8) {
            modules[y][x] = getBit(allCodewords[bitIndex >>> 3], 7 - (bitIndex & 7));
            bitIndex++;
          }
        }
      }
    }

    const applyMask = (mask) => {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          let invert;
          switch (mask) {
            case 0: invert = (x + y) % 2 === 0; break;
            case 1: invert = y % 2 === 0; break;
            case 2: invert = x % 3 === 0; break;
            case 3: invert = (x + y) % 3 === 0; break;
            case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
            case 5: invert = ((x * y) % 2) + ((x * y) % 3) === 0; break;
            case 6: invert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
            default: invert = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
          }
          if (invert && !isFunction[y][x]) modules[y][x] = !modules[y][x];
        }
      }
    };

    let mask = forcedMask;
    if (mask < 0) {
      let best = Infinity;
      for (let candidate = 0; candidate < 8; candidate++) {
        applyMask(candidate);
        drawFormat(candidate);
        const score = penaltyScore(modules);
        if (score < best) {
          best = score;
          mask = candidate;
        }
        applyMask(candidate); // a máscara é um XOR: aplicar de novo desfaz
      }
    }
    applyMask(mask);
    drawFormat(mask);

    return { size, mask, modules };
  }

  /**
   * Codifica um texto em QR Code.
   * @param {string} text Conteúdo (codificado em UTF-8, modo byte).
   * @param {{ecl?: 'L'|'M'|'Q'|'H', minVersion?: number, maxVersion?: number, mask?: number, boostEcl?: boolean}} [options]
   * @returns {{version: number, size: number, ecl: string, mask: number, modules: boolean[][]}}
   */
  function encode(text, options = {}) {
    const { ecl: eclName = 'M', minVersion = 1, maxVersion = 40, mask = -1, boostEcl = true } = options;
    if (!ECL[eclName]) throw new RangeError('Nível de correção inválido: ' + eclName);
    if (!(minVersion >= 1 && minVersion <= maxVersion && maxVersion <= 40)) throw new RangeError('Faixa de versões inválida.');
    if (!(mask >= -1 && mask <= 7)) throw new RangeError('Máscara inválida.');

    const bytes = Array.from(new TextEncoder().encode(String(text)));
    let ecl = ECL[eclName];

    // Menor versão em que o conteúdo cabe.
    let version = minVersion;
    let usedBits;
    for (;;) {
      const countBits = version <= 9 ? 8 : 16;
      usedBits = 4 + countBits + bytes.length * 8;
      if (bytes.length < 1 << countBits && usedBits <= dataCodewords(version, ecl) * 8) break;
      if (version >= maxVersion) throw new RangeError('Conteúdo longo demais para um QR Code.');
      version++;
    }

    // Aproveita a sobra de espaço para subir o nível de correção, sem aumentar o símbolo.
    if (boostEcl) {
      for (const candidate of [ECL.M, ECL.Q, ECL.H]) {
        if (candidate.ordinal > ecl.ordinal && usedBits <= dataCodewords(version, candidate) * 8) ecl = candidate;
      }
    }

    // Fluxo de bits: modo byte (0100) + contagem + dados + terminador + preenchimento.
    const capacityBits = dataCodewords(version, ecl) * 8;
    const bits = [];
    const append = (value, length) => {
      for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
    };
    append(0x4, 4);
    append(bytes.length, version <= 9 ? 8 : 16);
    bytes.forEach((byte) => append(byte, 8));
    append(0, Math.min(4, capacityBits - bits.length));
    append(0, (8 - (bits.length % 8)) % 8);
    for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) append(pad, 8);

    const codewords = [];
    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
      codewords.push(byte);
    }

    const matrix = buildMatrix(version, ecl, codewords, mask);
    return { version, size: matrix.size, ecl: ecl.name, mask: matrix.mask, modules: matrix.modules };
  }

  // Caminho SVG com as sequências horizontais de módulos escuros agrupadas.
  function toSvgPath(qr, border = 4) {
    const parts = [];
    for (let y = 0; y < qr.size; y++) {
      let x = 0;
      while (x < qr.size) {
        if (!qr.modules[y][x]) {
          x++;
          continue;
        }
        const start = x;
        while (x < qr.size && qr.modules[y][x]) x++;
        parts.push('M' + (start + border) + ',' + (y + border) + 'h' + (x - start) + 'v1h-' + (x - start) + 'z');
      }
    }
    return parts.join('');
  }

  function toSvgString(qr, { border = 4, dark = '#0f172a', light = '#ffffff', title = 'QR Code' } = {}) {
    const dim = qr.size + border * 2;
    const safeTitle = String(title).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + dim + ' ' + dim + '" shape-rendering="crispEdges" role="img" aria-label="' + safeTitle + '">' +
      '<title>' + safeTitle + '</title>' +
      '<rect width="100%" height="100%" fill="' + light + '"/>' +
      '<path d="' + toSvgPath(qr, border) + '" fill="' + dark + '"/>' +
      '</svg>'
    );
  }

  function drawToCanvas(qr, canvas, { scale = 8, border = 4, dark = '#0f172a', light = '#ffffff' } = {}) {
    const dim = (qr.size + border * 2) * scale;
    canvas.width = dim;
    canvas.height = dim;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = dark;
    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        if (qr.modules[y][x]) ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
      }
    }
    return canvas;
  }

  const api = { encode, toSvgPath, toSvgString, drawToCanvas };
  root.FatosQR = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
