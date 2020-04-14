const { dialog } = require("electron").remote;
let fck;
let le;
let hx;
let hy;
let momentoInicialAx = 0;
let momentoInicialAy = 0;
let momentoInicialBx = 0;
let momentoInicialBy = 0;
let nk;
let yn;
let omega;

const formInitialData = document.getElementById("initial-data");
const formAreaAco = document.getElementById("area-aco");
const parametros = document.getElementById("parametros");
const resultados = document.getElementById("resultados");

formInitialData.addEventListener("submit", e => {
  e.preventDefault();

  // tipoAco = document.getElementById("tipo-aco").value;
  fck = document.getElementById("fck").value;
  le = document.getElementById("le").value;
  hx = document.getElementById("hx").value;
  hy = document.getElementById("hy").value;
  momentoInicialAx = document.getElementById("momento-inicial-ax").value;
  momentoInicialBx = document.getElementById("momento-inicial-bx").value;
  momentoInicialAy = document.getElementById("momento-inicial-ay").value;
  momentoInicialBy = document.getElementById("momento-inicial-by").value;
  nk = document.getElementById("nk").value;
  yn = document.getElementById("yn").value;

  exibirParametros();

  const btnMemorial = document.getElementById("btn-memorial");
  btnMemorial.addEventListener("click", () => {
    dialog.showMessageBox({ message: showMemorial() });
  });
});

function calcularNsd() {
  return (yn ? nk * yn * 1.4 : nk * 1.4).toFixed(3);
}

function calcularFcd() {
  return fck / 1.4;
}

function calcularEsbeltez() {
  return {
    x: (3.46 * (le / hx)).toFixed(3),
    y: (3.46 * (le / hy)).toFixed(3)
  };
}

function selecionarMaiorMomentoInicial() {
  const momentoIncialAbsolutoAx = Math.abs(momentoInicialAx);
  const momentoIncialAbsolutoBx = Math.abs(momentoInicialBx);
  const momentoIncialAbsolutoAy = Math.abs(momentoInicialAy);
  const momentoIncialAbsolutoBy = Math.abs(momentoInicialBy);

  return {
    x:
      momentoIncialAbsolutoAx > momentoIncialAbsolutoBx
        ? momentoInicialAx
        : momentoInicialBx,
    y:
      momentoIncialAbsolutoAy > momentoIncialAbsolutoBy
        ? momentoInicialAy
        : momentoInicialBy
  };
}

function selecionarMenorMomentoInicial() {
  const momentoIncialAbsolutoAx = Math.abs(momentoInicialAx);
  const momentoIncialAbsolutoBx = Math.abs(momentoInicialBx);
  const momentoIncialAbsolutoAy = Math.abs(momentoInicialAy);
  const momentoIncialAbsolutoBy = Math.abs(momentoInicialBy);

  return {
    x:
      momentoIncialAbsolutoAx < momentoIncialAbsolutoBx
        ? momentoInicialAx
        : momentoInicialBx,
    y:
      momentoIncialAbsolutoAy < momentoIncialAbsolutoBy
        ? momentoInicialAy
        : momentoInicialBy
  };
}

function calcularMomentoMininimo() {
  const momentoMinimoX = calcularNsd() * (1.5 + 0.03 * hx);
  const momentoMinimoY = calcularNsd() * (1.5 + 0.03 * hy);
  return {
    x: momentoMinimoX.toFixed(3),
    y: momentoMinimoY.toFixed(3)
  };
}

function calcularMomentoPrimeiraOrdem() {
  return {
    x:
      selecionarMaiorMomentoInicial().x > calcularMomentoMininimo().x
        ? selecionarMaiorMomentoInicial().x
        : calcularMomentoMininimo().x,
    y:
      selecionarMaiorMomentoInicial().y > calcularMomentoMininimo().y
        ? selecionarMaiorMomentoInicial().y
        : calcularMomentoMininimo().y
  };
}

function calcularExcentricidadePrimeiraOrdem() {
  return {
    x: (calcularMomentoPrimeiraOrdem().x / calcularNsd()).toFixed(3),
    y: (calcularMomentoPrimeiraOrdem().y / calcularNsd()).toFixed(3)
  };
}

function calcularAlfaB() {
  let alfaBx;
  let alfaBy;

  if (calcularMomentoMininimo().x > selecionarMaiorMomentoInicial().x) {
    alfaBx = 1;
  } else {
    const alfaBxAlternativo =
      0.6 +
      0.4 *
        (selecionarMenorMomentoInicial().x / selecionarMaiorMomentoInicial().x);
    if (alfaBxAlternativo >= 0.4) {
      alfaBx = alfaBxAlternativo;
    } else {
      alfaBx = 0.4;
    }
  }

  if (calcularMomentoMininimo().y > selecionarMaiorMomentoInicial().y) {
    alfaBy = 1;
  } else {
    const alfaByAlternativo =
      0.6 +
      0.4 *
        (selecionarMenorMomentoInicial().y / selecionarMaiorMomentoInicial().y);
    console.log(selecionarMenorMomentoInicial().y);
    console.log(selecionarMaiorMomentoInicial().y);
    if (alfaByAlternativo >= 0.4) {
      alfaBy = alfaByAlternativo;
    } else {
      alfaBy = 0.4;
    }
  }

  return {
    x: alfaBx.toFixed(3),
    y: alfaBy.toFixed(3)
  };
}

function calcularEsbeltezLimite() {
  const esbeltezLimX =
    (25 + 12.5 * (calcularExcentricidadePrimeiraOrdem().x / hx)) /
    calcularAlfaB().x;
  const esbeltezLimY =
    (25 + 12.5 * (calcularExcentricidadePrimeiraOrdem().y / hy)) /
    calcularAlfaB().y;
  return {
    x: esbeltezLimX > 35 ? esbeltezLimX.toFixed(3) : 35,
    y: esbeltezLimY > 35 ? esbeltezLimY.toFixed(3) : 35
  };
}

// v
function calcularForcaNormalAdimensional() {
  return calcularNsd() / (hx * hy * calcularFcd());
}

function calcularRaioGiracao(hEixo) {
  rg = 0.005 / ((calcularForcaNormalAdimensional() + 0.5) * hEixo);
  return rg;
}

function calcularExcentricidadeSegundaOrdem(hEixo) {
  const excentricidade = (Math.pow(le, 2) / 10) * calcularRaioGiracao(hEixo);
  return excentricidade;
}

function verificarEfeitoSegundaOrdem() {
  let excentricidadeX = 0;
  let excentricidadeY = 0;

  if (calcularEsbeltez().x >= calcularEsbeltezLimite().x) {
    excentricidadeX = calcularExcentricidadeSegundaOrdem(hx);
  }

  if (calcularEsbeltez().y >= calcularEsbeltezLimite().y) {
    excentricidadeY = calcularExcentricidadeSegundaOrdem(hy);
  }
  return {
    x: excentricidadeX.toFixed(3),
    y: excentricidadeY.toFixed(3)
  };
}

function calcularMomentosTotais() {
  let mTotalX =
    calcularAlfaB().x * calcularMomentoPrimeiraOrdem().x +
    calcularNsd() * verificarEfeitoSegundaOrdem().x;
  let mTotalY =
    calcularAlfaB().y * calcularMomentoPrimeiraOrdem().y +
    calcularNsd() * verificarEfeitoSegundaOrdem().y;

  if (mTotalX < calcularMomentoPrimeiraOrdem().x) {
    mTotalX = calcularMomentoPrimeiraOrdem().x;
  }

  if (mTotalY < calcularMomentoPrimeiraOrdem().y) {
    mTotalY = calcularMomentoPrimeiraOrdem().y;
  }

  return {
    x: mTotalX,
    y: mTotalY
  };
}

function calcularU() {
  // const ux = calcularMomentosTotais().x / (hx * hx * hy * calcularFcd());
  // const uy = calcularMomentosTotais().y / (hy * hx * hy * calcularFcd());

  const e1x = parseFloat(calcularExcentricidadePrimeiraOrdem().x);
  const e2x = parseFloat(verificarEfeitoSegundaOrdem().x);
  const excentricidadeTotalX = e1x + e2x;

  const e1y = parseFloat(calcularExcentricidadePrimeiraOrdem().y);
  const e2y = parseFloat(verificarEfeitoSegundaOrdem().y);
  const excentricidadeTotalY = e1y + e2y;

  const ux = (calcularForcaNormalAdimensional() * excentricidadeTotalX) / hx;
  const uy = (calcularForcaNormalAdimensional() * excentricidadeTotalY) / hy;

  return {
    x: ux,
    y: uy
  };
}

function calcularD() {
  return {
    x: 4 / hx,
    y: 4 / hy
  };
}

function exibirParametros() {
  parametros.innerHTML = `
  <table class="pure-table" id="tabela-parametros">
    <thead>
      <tr>
        <th>d'x/hx</th>
        <th>d'y/hy</th>
        <th>ux</th>
        <th>uy</th>
        <th>V</th>
        <th>Memorial</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>${calcularD().x}</td>
        <td>${calcularD().y}</td>
        <td>${calcularU().x.toFixed(3)}</td>
        <td>${calcularU().y.toFixed(3)}</td>
        <td>${calcularForcaNormalAdimensional().toFixed(3)}</td>
        <td><button id="btn-memorial">LINK</button></td>
      </tr>
    </tbody>
  </table>
  `;
}

function showMemorial() {
  return `
  MEMORIAL DE CÁLCULO
  Nsd: ${calcularNsd()} KN
  Esbeltez x: ${calcularEsbeltez().x}
  Esbeltez y: ${calcularEsbeltez().y}
  Esbeltez Limite x: ${calcularEsbeltezLimite().x}
  Esbeltez Limite y: ${calcularEsbeltezLimite().y}
  alfaBx: ${calcularAlfaB().x}
  alfaBy: ${calcularAlfaB().y}
  MminX: ${calcularMomentoMininimo().x} KN.cm
  MminY: ${calcularMomentoMininimo().y} KN.cm
  M1X: ${calcularMomentoPrimeiraOrdem().x} KN.cm
  M1Y: ${calcularMomentoPrimeiraOrdem().y} KN.cm
  e1x: ${calcularExcentricidadePrimeiraOrdem().x} cm
  e1y: ${calcularExcentricidadePrimeiraOrdem().y} cm
  e2x: ${verificarEfeitoSegundaOrdem().x} cm
  e2y: ${verificarEfeitoSegundaOrdem().y} cm
  MtX: ${calcularMomentosTotais().x} KN.cm
  MtY: ${calcularMomentosTotais().y} KN.cm
  d'x/hx: ${calcularD().x}
  d'y/hy: ${calcularD().y}
  ux: ${calcularU().x.toFixed(3)}
  uy: ${calcularU().y.toFixed(3)}
  v: ${calcularForcaNormalAdimensional()}
  `;
}

formAreaAco.addEventListener("submit", e => {
  e.preventDefault();

  fck = document.getElementById("fck2").value;
  omega = document.getElementById("omega").value;
  hx = document.getElementById("hx2").value;
  hy = document.getElementById("hy2").value;

  resultados.innerHTML = `Área de aço: ${calcularAreaAco().toFixed(3)} cm²`;
});

function calcularAreaAco() {
  areaAco = (omega * hx * hy * calcularFcd()) / 43.48;
  return areaAco;
}
