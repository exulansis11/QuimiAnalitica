/**
 * Trilha de aprendizagem: 6 níveis, do elementar (matemática) ao avançado (instrumental).
 * Teoria escrita em mini-markdown com TeX (ver <Rich/>). Use String.raw para preservar "\".
 */
const r = String.raw;

export type LevelId = 0 | 1 | 2 | 3 | 4 | 5;

export interface Level {
  id: LevelId;
  name: string;
  short: string;
  description: string;
}

export const LEVELS: Level[] = [
  { id: 0, name: "Matemática Essencial", short: "Matemática", description: "Notação científica, algarismos significativos, logaritmos, unidades e proporções — a base de todo cálculo analítico." },
  { id: 1, name: "Fundamentos Quantitativos", short: "Fundamentos", description: "Mol, concentrações, diluições e a estequiometria das titulações." },
  { id: 2, name: "Erros e Estatística", short: "Estatística", description: "Exatidão, precisão, intervalos de confiança, testes de hipótese, propagação de incertezas e calibração." },
  { id: 3, name: "Equilíbrio Químico", short: "Equilíbrio", description: "Atividade, pH exato, tampões, sistemas polipróticos e solubilidade." },
  { id: 4, name: "Métodos Clássicos", short: "Clássicos", description: "Volumetrias de neutralização, precipitação, complexação e oxirredução; gravimetria." },
  { id: 5, name: "Métodos Instrumentais", short: "Instrumental", description: "Espectrofotometria, potenciometria e cromatografia." },
];

export interface ToolLink {
  to: string;
  label: string;
  kind: "simulador" | "calculadora" | "laboratório";
}

export interface Topic {
  id: string;
  level: LevelId;
  title: string;
  summary: string;
  objectives: string[];
  theory: { heading: string; body: string }[];
  formulas: { label: string; tex: string }[];
  tools: ToolLink[];
  refs: string;
}

export const TOPICS: Topic[] = [
  /* ============================ NÍVEL 0 ============================ */
  {
    id: "m-cientifica",
    level: 0,
    title: "Notação científica e ordens de grandeza",
    summary: "Como escrever e operar com números muito grandes ou muito pequenos — de 6,022×10²³ a 1,8×10⁻¹⁰.",
    objectives: ["Escrever qualquer número como a × 10ⁿ com 1 ≤ a < 10", "Multiplicar, dividir e elevar potências de 10", "Estimar ordens de grandeza para checar resultados"],
    theory: [
      {
        heading: "A forma padrão",
        body: r`Em química analítica as grandezas variam por dezenas de ordens de grandeza: a constante de Avogadro vale $6{,}022\times10^{23}\ \text{mol}^{-1}$ e o $K_{ps}$ do AgCl vale $1{,}8\times10^{-10}$. A notação científica escreve todo número como

$$N = a \times 10^{n}, \qquad 1 \le |a| < 10,\ n \in \mathbb{Z}$$

Para converter, conte quantas casas a vírgula "anda": para a esquerda, $n$ aumenta; para a direita, $n$ diminui.

- $0{,}000\,45 = 4{,}5\times10^{-4}$ (vírgula andou 4 casas para a direita)
- $25\,300 = 2{,}53\times10^{4}$`,
      },
      {
        heading: "Operações",
        body: r`$$ (a\times10^{m})(b\times10^{n}) = ab\times10^{m+n} \qquad \frac{a\times10^{m}}{b\times10^{n}} = \frac{a}{b}\times10^{m-n} \qquad (a\times10^{m})^{p}=a^{p}\times10^{mp}$$

Para **somar ou subtrair**, primeiro iguale os expoentes: $3{,}0\times10^{-3} + 2{,}0\times10^{-4} = 3{,}0\times10^{-3} + 0{,}20\times10^{-3} = 3{,}2\times10^{-3}$.

> Dica de prova: antes de usar a calculadora, estime a ordem de grandeza. Se a concentração de um ácido diluído "deu" $10^{3}$ mol/L, há erro de expoente.`,
      },
    ],
    formulas: [
      { label: "Produto", tex: r`10^{m}\cdot10^{n}=10^{m+n}` },
      { label: "Quociente", tex: r`10^{m}/10^{n}=10^{m-n}` },
      { label: "Raiz", tex: r`\sqrt{10^{-10}} = 10^{-5}` },
    ],
    tools: [{ to: "/calculadoras/matematica", label: "Calculadora de notação e algarismos", kind: "calculadora" }],
    refs: "Harris, Análise Química Quantitativa, cap. 1; Skoog, Fundamentos de Química Analítica, cap. 4.",
  },
  {
    id: "m-algarismos",
    level: 0,
    title: "Algarismos significativos e arredondamento",
    summary: "Quantos dígitos um resultado pode ter? As regras que todo laudo analítico segue.",
    objectives: ["Contar algarismos significativos", "Aplicar regras de soma/subtração e multiplicação/divisão", "Tratar logaritmos (pH) corretamente"],
    theory: [
      {
        heading: "O que é significativo",
        body: r`Algarismos significativos são os dígitos conhecidos com certeza **mais o primeiro incerto**. Uma bureta lida como $23{,}46$ mL tem 4 significativos — o "6" é estimado.

- Zeros à **esquerda** nunca são significativos: $0{,}0045$ → 2 significativos.
- Zeros **entre** dígitos sempre são: $1{,}0045$ → 5.
- Zeros à **direita da vírgula** são: $2{,}500$ → 4.
- Em $2500$ (sem vírgula) é ambíguo — use $2{,}50\times10^{3}$ para deixar claro.`,
      },
      {
        heading: "Regras de cálculo",
        body: r`#### Soma e subtração
O resultado tem o mesmo número de **casas decimais** que o termo com menos casas: $12{,}1 + 0{,}353 = 12{,}5$.

#### Multiplicação e divisão
O resultado tem o mesmo número de **algarismos significativos** que o fator com menos significativos: $3{,}26 \times 1{,}1 = 3{,}6$.

#### Logaritmos
Em $\text{pH} = -\log[\text{H}^+]$, o número de **casas decimais** do pH é igual ao número de significativos da concentração: $[\text{H}^+] = 2{,}0\times10^{-3}$ → pH $= 2{,}70$.

> Arredonde só no final. Guarde dígitos extras nas etapas intermediárias para não acumular erro de arredondamento.`,
      },
    ],
    formulas: [{ label: "pH com 2 significativos em [H⁺]", tex: r`[\text{H}^+]=3{,}2\times10^{-4}\Rightarrow \text{pH}=3{,}49` }],
    tools: [{ to: "/calculadoras/matematica", label: "Contador de algarismos significativos", kind: "calculadora" }],
    refs: "Harris, cap. 3; Skoog, cap. 6 (apêndice de algarismos significativos).",
  },
  {
    id: "m-log",
    level: 0,
    title: "Logaritmos, potências e a escala p",
    summary: "pH, pKa, pKps, pM, absorbância: tudo é logaritmo. Domine as propriedades e as conversões.",
    objectives: ["Aplicar propriedades de log", "Converter entre [X] e pX", "Interpretar escalas logarítmicas (1 unidade = fator 10)"],
    theory: [
      {
        heading: "Propriedades essenciais",
        body: r`$$\log(ab)=\log a+\log b \qquad \log\frac{a}{b}=\log a-\log b \qquad \log a^{n}=n\log a \qquad \log 10^{x}=x$$

O operador **p** significa $-\log$: $\text{pX} = -\log[X]$. Logo $[X] = 10^{-\text{pX}}$.

| Grandeza | Definição |
|---|---|
| pH | $-\log a_{\text{H}^+}$ |
| pKa | $-\log K_a$ |
| pKps | $-\log K_{ps}$ |
| pAg, pCa | $-\log[\text{Ag}^+]$, $-\log[\text{Ca}^{2+}]$ |
| Absorbância | $A = -\log T$ |`,
      },
      {
        heading: "Pensar em escala logarítmica",
        body: r`Uma unidade de pH corresponde a um fator **10** em $[\text{H}^+]$; 0,30 unidade corresponde a um fator **2** ($\log 2 = 0{,}301$). Por isso, diluir 10× um ácido forte aumenta o pH em 1 unidade, e dobrar a razão base/ácido de um tampão aumenta o pH em 0,30.

Relações úteis: $\text{pH} + \text{pOH} = \text{p}K_w = 14{,}00$ (25 °C) e $\text{p}K_a + \text{p}K_b = 14{,}00$ para um par conjugado.`,
      },
    ],
    formulas: [
      { label: "Definição p", tex: r`\text{pX}=-\log[X],\quad [X]=10^{-\text{pX}}` },
      { label: "Água", tex: r`\text{pH}+\text{pOH}=14{,}00` },
      { label: "Par conjugado", tex: r`K_aK_b=K_w` },
    ],
    tools: [{ to: "/calculadoras/matematica", label: "Conversor de escalas p", kind: "calculadora" }],
    refs: "Harris, cap. 6; Skoog, cap. 9.",
  },
  {
    id: "m-unidades",
    level: 0,
    title: "Unidades, prefixos SI e análise dimensional",
    summary: "mg, µL, mmol, ppm: converta sem medo usando fatores de conversão que se cancelam.",
    objectives: ["Usar prefixos SI (k, m, µ, n)", "Montar cadeias de fatores de conversão", "Verificar coerência dimensional"],
    theory: [
      {
        heading: "Prefixos",
        body: r`| Prefixo | Símbolo | Fator |
|---|---|---|
| quilo | k | $10^{3}$ |
| mili | m | $10^{-3}$ |
| micro | µ | $10^{-6}$ |
| nano | n | $10^{-9}$ |
| pico | p | $10^{-12}$ |

Uma conveniência muito usada em titulações: $\text{mol/L} = \text{mmol/mL}$. Assim, $25{,}00\ \text{mL} \times 0{,}1000\ \text{mmol/mL} = 2{,}500\ \text{mmol}$ — sem converter mL para L.`,
      },
      {
        heading: "Análise dimensional",
        body: r`Multiplique por frações iguais a 1 de modo que as unidades indesejadas se cancelem:

$$250\ \text{mg}\times\frac{1\ \text{g}}{1000\ \text{mg}}\times\frac{1\ \text{mol}}{58{,}44\ \text{g}} = 4{,}28\times10^{-3}\ \text{mol}$$

Se as unidades finais não forem as esperadas, a montagem está errada — é a verificação mais barata que existe.`,
      },
    ],
    formulas: [{ label: "Identidade útil", tex: r`1\ \tfrac{\text{mol}}{\text{L}}=1\ \tfrac{\text{mmol}}{\text{mL}}=1\ \tfrac{\mu\text{mol}}{\mu\text{L}}` }],
    tools: [{ to: "/calculadoras/solucoes", label: "Conversor de concentrações", kind: "calculadora" }],
    refs: "Harris, cap. 1; Skoog, cap. 4.",
  },
  {
    id: "m-proporcao",
    level: 0,
    title: "Proporção, regra de três e porcentagem",
    summary: "A ferramenta mais usada da química analítica: proporcionalidade direta entre quantidades.",
    objectives: ["Montar regras de três diretas", "Calcular porcentagens, teor e pureza", "Calcular erro relativo"],
    theory: [
      {
        heading: "Proporcionalidade",
        body: r`Se $y = kx$, então $\dfrac{y_1}{x_1} = \dfrac{y_2}{x_2}$. Massa e mols, sinal e concentração (Lei de Beer), volume gasto e quantidade de analito — todas são relações diretas.

**Pureza/teor** de uma amostra:
$$\%\ \text{(m/m)} = \frac{m_\text{analito}}{m_\text{amostra}}\times100$$

**Erro relativo** de um resultado:
$$E_r(\%) = \frac{x_\text{medido}-x_\text{verdadeiro}}{x_\text{verdadeiro}}\times100$$`,
      },
      {
        heading: "Partes por milhão",
        body: r`Para soluções aquosas diluídas (densidade ≈ 1 g/mL):

$$1\ \text{ppm} = 1\ \text{mg/L} = 1\ \mu\text{g/mL} \qquad 1\ \text{ppb} = 1\ \mu\text{g/L}$$

Em sólidos, ppm = mg/kg.`,
      },
    ],
    formulas: [
      { label: "Teor", tex: r`\%=\frac{m_\text{analito}}{m_\text{amostra}}\times100` },
      { label: "Erro relativo", tex: r`E_r=\frac{x-\mu}{\mu}\times100\%` },
    ],
    tools: [{ to: "/calculadoras/matematica", label: "Regra de três e erro relativo", kind: "calculadora" }],
    refs: "Skoog, cap. 4 e 5.",
  },

  /* ============================ NÍVEL 1 ============================ */
  {
    id: "f-mol",
    level: 1,
    title: "Mol, massa molar e estequiometria",
    summary: "Do grama ao mol e de volta: a ponte entre o que se pesa e o que reage.",
    objectives: ["Calcular massa molar a partir da fórmula (incl. hidratos)", "Converter massa ↔ mol ↔ partículas", "Usar a estequiometria da reação"],
    theory: [
      {
        heading: "Massa molar",
        body: r`A massa molar $M$ (g/mol) é a soma das massas atômicas multiplicadas pelo número de átomos. Para hidratos, some a água: $M(\text{CuSO}_4\cdot5\text{H}_2\text{O}) = 159{,}61 + 5(18{,}015) = 249{,}69$ g/mol.

$$n = \frac{m}{M} \qquad N = n\cdot N_A$$`,
      },
      {
        heading: "Estequiometria",
        body: r`Os coeficientes da equação balanceada dão a **razão molar**. Em $\text{H}_2\text{SO}_4 + 2\text{NaOH} \rightarrow \text{Na}_2\text{SO}_4 + 2\text{H}_2\text{O}$, cada mol de ácido consome 2 mol de base:

$$n_{\text{NaOH}} = 2\,n_{\text{H}_2\text{SO}_4}$$

> Erro clássico de prova: esquecer o fator estequiométrico em ácidos dipróticos, no permanganato (5 e⁻) ou no dicromato (6 e⁻).`,
      },
    ],
    formulas: [
      { label: "Quantidade de matéria", tex: r`n=\frac{m}{M}` },
      { label: "Razão estequiométrica", tex: r`aA+bB\to\ldots\Rightarrow \frac{n_A}{a}=\frac{n_B}{b}` },
    ],
    tools: [
      { to: "/calculadoras/massa-molar", label: "Massa molar com composição %", kind: "calculadora" },
      { to: "/tabela", label: "Tabela periódica interativa", kind: "calculadora" },
    ],
    refs: "Skoog, cap. 4; Harris, cap. 1.",
  },
  {
    id: "f-conc",
    level: 1,
    title: "Expressões de concentração",
    summary: "mol/L, g/L, % m/m, % m/v, ppm, ppb e conversões a partir de reagentes comerciais.",
    objectives: ["Converter entre unidades de concentração", "Calcular a molaridade de reagentes concentrados (% e densidade)", "Diferenciar concentração analítica e de equilíbrio"],
    theory: [
      {
        heading: "Principais expressões",
        body: r`| Expressão | Definição |
|---|---|
| Molaridade | $c = n/V$ (mol/L) |
| Concentração mássica | $\rho = m/V$ (g/L) |
| % m/m | g de soluto / 100 g de solução |
| % m/v | g de soluto / 100 mL de solução |
| ppm | mg/L (aquoso) ou mg/kg |

Conversão central: $\rho\ (\text{g/L}) = c\ (\text{mol/L}) \times M$.`,
      },
      {
        heading: "Reagentes comerciais",
        body: r`Ácidos concentrados são vendidos em % m/m com densidade $d$ (g/mL). Em 1 L há $1000\,d$ gramas de solução, das quais a fração $w$ é soluto:

$$c = \frac{1000\cdot d\cdot w}{M}$$

HCl 37 %, $d = 1{,}19$: $c = \dfrac{1000(1{,}19)(0{,}37)}{36{,}46} = 12{,}1$ mol/L.`,
      },
      {
        heading: "Concentração analítica × de equilíbrio",
        body: r`A **concentração analítica** ($c_\text{HA}$) é o total adicionado; a **concentração de equilíbrio** ($[\text{HA}]$) é o que resta daquela espécie depois que o equilíbrio se estabelece. Para ácido acético 0,10 M, $c_\text{HA} = 0{,}10$ M, mas $[\text{HA}] \approx 0{,}0987$ M e $[\text{A}^-] \approx 1{,}3\times10^{-3}$ M.`,
      },
    ],
    formulas: [
      { label: "Molaridade", tex: r`c=\frac{n}{V}=\frac{m}{M\,V}` },
      { label: "Reagente comercial", tex: r`c=\frac{1000\,d\,w}{M}` },
      { label: "ppm", tex: r`1\text{ ppm}=1\text{ mg L}^{-1}` },
    ],
    tools: [{ to: "/calculadoras/solucoes", label: "Concentrações, diluição e preparo", kind: "calculadora" }],
    refs: "Skoog, cap. 4; Harris, cap. 1.",
  },
  {
    id: "f-diluicao",
    level: 1,
    title: "Diluição e preparo de soluções",
    summary: "C₁V₁ = C₂V₂, diluições seriadas e o roteiro de bancada para preparar soluções.",
    objectives: ["Aplicar a conservação da quantidade de soluto", "Planejar diluições seriadas", "Calcular a massa a pesar para preparar uma solução"],
    theory: [
      {
        heading: "Conservação do soluto",
        body: r`Ao diluir, a quantidade de soluto não muda — só o volume:

$$c_1V_1 = c_2V_2$$

Em diluições seriadas, os fatores se multiplicam: três diluições 1:10 seguidas dão fator $10^3$.

**Preparo a partir de sólido:** $m = c\cdot V\cdot M / (\text{pureza})$. Para 250,0 mL de NaOH 0,100 M: $m = 0{,}100\times0{,}2500\times40{,}00 = 1{,}000$ g.`,
      },
      {
        heading: "Na bancada",
        body: r`1. Pese o soluto (balança analítica para padrões primários).
2. Dissolva em béquer com menos água que o volume final.
3. Transfira quantitativamente para o balão volumétrico, lavando o béquer.
4. Complete até o menisco e homogeneíze.

> Ácidos concentrados: **sempre** adicione o ácido sobre a água, nunca o contrário.`,
      },
    ],
    formulas: [
      { label: "Diluição", tex: r`c_1V_1=c_2V_2` },
      { label: "Massa a pesar", tex: r`m=\frac{c\,V\,M}{\text{pureza}}` },
      { label: "Fator de diluição", tex: r`f=\frac{V_\text{final}}{V_\text{alíquota}}` },
    ],
    tools: [{ to: "/calculadoras/solucoes", label: "Diluição e preparo passo a passo", kind: "calculadora" }],
    refs: "Harris, cap. 1-2; Skoog, cap. 4.",
  },
  {
    id: "f-volumetria-calc",
    level: 1,
    title: "Cálculos volumétricos e padronização",
    summary: "Ponto de equivalência, padrões primários, fator de correção e teor por titulação.",
    objectives: ["Calcular a concentração do titulante por padronização", "Calcular teor de analito por titulação direta e por retrotitulação", "Distinguir ponto de equivalência e ponto final"],
    theory: [
      {
        heading: "Equivalência",
        body: r`No ponto de equivalência, a quantidade de titulante adicionada é **estequiometricamente** igual à de analito. O **ponto final** é o que se observa (mudança de cor, salto de potencial). A diferença é o **erro de titulação**.

$$n_\text{analito} = \frac{a}{t}\, c_\text{titulante} V_\text{titulante}$$`,
      },
      {
        heading: "Padronização",
        body: r`Um **padrão primário** é puro (≥ 99,9 %), estável, não higroscópico e de massa molar alta (reduz erro de pesagem). Exemplos: biftalato de potássio (KHP, 204,22 g/mol) para bases; Na₂CO₃ e bórax para ácidos; Na₂C₂O₄ para KMnO₄; NaCl para AgNO₃; CaCO₃ para EDTA.

$$c_\text{NaOH} = \frac{m_\text{KHP}/M_\text{KHP}}{V_\text{NaOH}}$$

**Fator de correção:** $f = c_\text{real}/c_\text{nominal}$.`,
      },
      {
        heading: "Retrotitulação",
        body: r`Adiciona-se excesso conhecido de reagente e titula-se o que sobrou:

$$n_\text{analito} = n_\text{adicionado} - n_\text{excesso titulado}$$

Útil para analitos que reagem lentamente (CaCO₃ com HCl) ou quando falta um indicador adequado (método de Volhard).`,
      },
    ],
    formulas: [
      { label: "Titulação 1:1", tex: r`c_aV_a=c_tV_t` },
      { label: "Teor", tex: r`\%=\frac{c_tV_t\,\frac{a}{t}\,M}{m_\text{amostra}}\times100` },
      { label: "Retrotitulação", tex: r`n=n_\text{total}-n_\text{excesso}` },
    ],
    tools: [
      { to: "/simuladores/titulacao", label: "Titulação animada", kind: "simulador" },
      { to: "/calculadoras/titulacao", label: "Teor e padronização", kind: "calculadora" },
    ],
    refs: "Skoog, cap. 13; Harris, cap. 7.",
  },

  /* ============================ NÍVEL 2 ============================ */
  {
    id: "e-erros",
    level: 2,
    title: "Erros, exatidão e precisão",
    summary: "Erros sistemáticos e aleatórios; por que um método pode ser preciso e inexato.",
    objectives: ["Distinguir exatidão de precisão", "Classificar erros (instrumental, de método, pessoal)", "Calcular erro absoluto e relativo"],
    theory: [
      {
        heading: "Exatidão × precisão",
        body: r`**Exatidão** é a proximidade do valor verdadeiro (medida pelo erro, ou pela recuperação). **Precisão** é a concordância entre réplicas (medida pelo desvio padrão). Um método pode ser preciso e inexato quando há erro sistemático.

| Tipo de erro | Natureza | Efeito | Como reduzir |
|---|---|---|---|
| Sistemático (determinado) | causa identificável, mesmo sinal | afeta a **exatidão** | calibração, branco, padrão de referência |
| Aleatório (indeterminado) | flutuações imprevisíveis | afeta a **precisão** | mais réplicas, estatística |
| Grosseiro | engano | ponto anômalo | teste Q/Grubbs, refazer |`,
      },
      {
        heading: "Fontes de erro sistemático",
        body: r`- **Instrumental:** vidraria descalibrada, balança desregulada.
- **De método:** reação incompleta, coprecipitação, indicador virando antes do PE.
- **Pessoal:** leitura do menisco com paralaxe, percepção de cor.

Os erros sistemáticos podem ser **constantes** (independem do tamanho da amostra — pesam mais em amostras pequenas) ou **proporcionais** (crescem com a amostra, ex.: interferente na matriz).`,
      },
    ],
    formulas: [
      { label: "Erro absoluto", tex: r`E=x_i-x_v` },
      { label: "Recuperação", tex: r`R(\%)=\frac{x_\text{obtido}}{x_\text{esperado}}\times100` },
    ],
    tools: [{ to: "/simuladores/estatistica", label: "Alvo: exatidão × precisão", kind: "simulador" }],
    refs: "Skoog, cap. 5; Harris, cap. 3.",
  },
  {
    id: "e-descritiva",
    level: 2,
    title: "Média, desvio padrão e intervalo de confiança",
    summary: "Resumir réplicas e dizer, com 95 % de confiança, onde está o valor verdadeiro.",
    objectives: ["Calcular média, s, CV (DPR)", "Construir intervalos de confiança com t de Student", "Interpretar a distribuição normal"],
    theory: [
      {
        heading: "Estatística descritiva",
        body: r`$$\bar{x}=\frac{\sum x_i}{n} \qquad s=\sqrt{\frac{\sum (x_i-\bar{x})^2}{n-1}} \qquad \text{CV}=\text{DPR}=\frac{s}{\bar{x}}\times100\%$$

O divisor $n-1$ (graus de liberdade) corrige o fato de $\bar x$ ter sido estimado dos próprios dados.

Na distribuição normal, ~68,3 % dos resultados ficam em $\mu\pm1\sigma$, 95,4 % em $\mu\pm2\sigma$ e 99,7 % em $\mu\pm3\sigma$.`,
      },
      {
        heading: "Intervalo de confiança",
        body: r`Com poucas réplicas, $s$ é uma estimativa incerta de $\sigma$; por isso usa-se o $t$ de Student com $n-1$ graus de liberdade:

$$\mu = \bar{x} \pm \frac{t\,s}{\sqrt{n}}$$

| GL | 90 % | 95 % | 99 % |
|---|---|---|---|
| 2 | 2,920 | 4,303 | 9,925 |
| 3 | 2,353 | 3,182 | 5,841 |
| 4 | 2,132 | 2,776 | 4,604 |
| 5 | 2,015 | 2,571 | 4,032 |
| 9 | 1,833 | 2,262 | 3,250 |

> Interpretação correta: se repetíssemos o procedimento muitas vezes, 95 % dos intervalos construídos assim conteriam $\mu$.`,
      },
    ],
    formulas: [
      { label: "Desvio padrão", tex: r`s=\sqrt{\tfrac{\sum(x_i-\bar x)^2}{n-1}}` },
      { label: "IC", tex: r`\mu=\bar x\pm\tfrac{ts}{\sqrt n}` },
      { label: "Desvio padrão da média", tex: r`s_{\bar x}=s/\sqrt n` },
    ],
    tools: [
      { to: "/calculadoras/estatistica", label: "Estatística descritiva e IC", kind: "calculadora" },
      { to: "/simuladores/estatistica", label: "Simulação de intervalos de confiança", kind: "simulador" },
      { to: "/laboratorio", label: "Laboratório de dados", kind: "laboratório" },
    ],
    refs: "Skoog, cap. 6-7; Harris, cap. 4.",
  },
  {
    id: "e-testes",
    level: 2,
    title: "Testes de significância: Q, Grubbs, t e F",
    summary: "Rejeitar um outlier? Os dois métodos concordam? A média bate com o certificado?",
    objectives: ["Aplicar teste Q de Dixon e Grubbs", "Comparar média com valor de referência (t)", "Comparar duas médias (t) e duas precisões (F)"],
    theory: [
      {
        heading: "Rejeição de valores anômalos",
        body: r`**Teste Q (Dixon):** $Q = \dfrac{|\text{suspeito} - \text{vizinho}|}{\text{amplitude}}$. Rejeita-se se $Q_\text{calc} > Q_\text{crít}$.

**Teste de Grubbs (recomendado pela ISO):** $G = \dfrac{|\text{suspeito} - \bar x|}{s}$.

| n | Q (95 %) | G (95 %) |
|---|---|---|
| 4 | 0,829 | 1,481 |
| 5 | 0,710 | 1,715 |
| 6 | 0,625 | 1,887 |
| 7 | 0,568 | 2,020 |`,
      },
      {
        heading: "Testes t",
        body: r`**Média × valor de referência:** $t = \dfrac{|\bar x - \mu|\sqrt{n}}{s}$, com $n-1$ GL.

**Duas médias** (precisões semelhantes pelo teste F):
$$t=\frac{|\bar x_1-\bar x_2|}{s_\text{agr}}\sqrt{\frac{n_1n_2}{n_1+n_2}},\qquad s_\text{agr}=\sqrt{\frac{(n_1-1)s_1^2+(n_2-1)s_2^2}{n_1+n_2-2}}$$

Se $t_\text{calc} > t_\text{crít}$, a diferença é **significativa** no nível de confiança escolhido.`,
      },
      {
        heading: "Teste F",
        body: r`Compara variâncias: $F = s_1^2 / s_2^2$ com $s_1 > s_2$. Se $F_\text{calc} > F_\text{crít}$, as precisões diferem significativamente. Use-o antes do teste t de duas médias para decidir entre $s$ agrupado e o teste de Welch.`,
      },
    ],
    formulas: [
      { label: "Q", tex: r`Q=\frac{|x_q-x_v|}{w}` },
      { label: "t (referência)", tex: r`t=\frac{|\bar x-\mu|\sqrt n}{s}` },
      { label: "F", tex: r`F=s_1^2/s_2^2` },
    ],
    tools: [
      { to: "/calculadoras/testes", label: "Testes Q, Grubbs, t e F", kind: "calculadora" },
      { to: "/laboratorio", label: "Laboratório de dados", kind: "laboratório" },
    ],
    refs: "Skoog, cap. 7; Harris, cap. 4; Miller & Miller, Statistics and Chemometrics.",
  },
  {
    id: "e-propagacao",
    level: 2,
    title: "Propagação de incertezas",
    summary: "Como a incerteza da bureta, da balança e do balão chegam ao resultado final.",
    objectives: ["Propagar incertezas em somas e produtos", "Tratar logaritmos e potências", "Identificar a fonte dominante de incerteza"],
    theory: [
      {
        heading: "Regras",
        body: r`| Operação | Incerteza |
|---|---|
| $y = a + b - c$ | $s_y=\sqrt{s_a^2+s_b^2+s_c^2}$ |
| $y = ab/c$ | $\dfrac{s_y}{y}=\sqrt{\left(\dfrac{s_a}{a}\right)^2+\left(\dfrac{s_b}{b}\right)^2+\left(\dfrac{s_c}{c}\right)^2}$ |
| $y = a^x$ | $\dfrac{s_y}{y}=x\dfrac{s_a}{a}$ |
| $y = \log a$ | $s_y = 0{,}434\,\dfrac{s_a}{a}$ |
| $y = 10^a$ | $\dfrac{s_y}{y}=2{,}303\,s_a$ |

Somas propagam incertezas **absolutas**; produtos propagam incertezas **relativas**.`,
      },
      {
        heading: "Exemplo",
        body: r`Volume gasto numa bureta: $V = V_f - V_i = (23{,}46 \pm 0{,}02) - (0{,}25 \pm 0{,}02) = 23{,}21 \pm 0{,}028$ mL.

> A leitura da bureta entra **duas** vezes. Por isso volumes gastos pequenos (< 10 mL) têm incerteza relativa grande — escolha massas de amostra que gastem 20–40 mL.`,
      },
    ],
    formulas: [
      { label: "Soma", tex: r`s_y=\sqrt{\textstyle\sum s_i^2}` },
      { label: "Produto", tex: r`\frac{s_y}{y}=\sqrt{\textstyle\sum (s_i/x_i)^2}` },
      { label: "Log", tex: r`s_y=0{,}434\,s_x/x` },
    ],
    tools: [{ to: "/calculadoras/propagacao", label: "Propagação de incertezas", kind: "calculadora" }],
    refs: "Harris, cap. 3; Skoog, cap. 6.",
  },
  {
    id: "e-calibracao",
    level: 2,
    title: "Calibração, LOD/LOQ e validação",
    summary: "Mínimos quadrados, curva analítica, adição de padrão, limites de detecção e figuras de mérito.",
    objectives: ["Ajustar reta por mínimos quadrados e avaliar resíduos", "Calcular concentração de desconhecido com incerteza", "Determinar LOD, LOQ e aplicar adição de padrão"],
    theory: [
      {
        heading: "Mínimos quadrados",
        body: r`Para $y = mx + b$:

$$m=\frac{\sum(x_i-\bar x)(y_i-\bar y)}{\sum(x_i-\bar x)^2}\qquad b=\bar y-m\bar x\qquad s_{y/x}=\sqrt{\frac{\sum(y_i-\hat y_i)^2}{n-2}}$$

$R^2$ próximo de 1 **não garante** linearidade: inspecione o gráfico de resíduos (devem ser aleatórios em torno de zero).`,
      },
      {
        heading: "Desconhecido e limites",
        body: r`$$x_0=\frac{y_0-b}{m},\qquad s_{x_0}=\frac{s_{y/x}}{|m|}\sqrt{\frac1k+\frac1n+\frac{(y_0-\bar y)^2}{m^2\sum(x_i-\bar x)^2}}$$

Limites (ICH Q2): $\text{LOD}=3{,}3\,s/m$ e $\text{LOQ}=10\,s/m$, com $s$ = desvio do branco ou $s_{y/x}$.

**Adição de padrão:** adicionam-se quantidades crescentes de analito à própria amostra; extrapola-se a reta até $y=0$. A concentração é $|x_\text{intercepto}| = b/m$. Compensa **efeitos de matriz**.`,
      },
      {
        heading: "Figuras de mérito (validação)",
        body: r`- **Seletividade**, **linearidade** e **faixa de trabalho**
- **Precisão:** repetibilidade e precisão intermediária (DPR)
- **Exatidão:** recuperação (tipicamente 80–110 %) ou material de referência certificado
- **LOD/LOQ** e **robustez**`,
      },
    ],
    formulas: [
      { label: "Inclinação", tex: r`m=\frac{S_{xy}}{S_{xx}}` },
      { label: "LOD / LOQ", tex: r`\text{LOD}=\frac{3{,}3s}{m},\ \text{LOQ}=\frac{10s}{m}` },
      { label: "Adição de padrão", tex: r`c_x=\frac{b}{m}` },
    ],
    tools: [
      { to: "/laboratorio", label: "Laboratório: curva de calibração", kind: "laboratório" },
      { to: "/simuladores/espectro", label: "Espectrofotômetro virtual", kind: "simulador" },
    ],
    refs: "Harris, cap. 4-5; Skoog, cap. 8; ICH Q2(R2); INMETRO DOQ-CGCRE-008.",
  },

  /* ============================ NÍVEL 3 ============================ */
  {
    id: "q-equilibrio",
    level: 3,
    title: "Equilíbrio, constantes e atividade",
    summary: "Constante de equilíbrio, Le Chatelier, força iônica e coeficientes de atividade.",
    objectives: ["Escrever expressões de K", "Calcular força iônica e γ (Debye-Hückel)", "Entender o efeito salino"],
    theory: [
      {
        heading: "Constante de equilíbrio",
        body: r`Para $aA + bB \rightleftharpoons cC + dD$:

$$K=\frac{a_C^c\,a_D^d}{a_A^a\,a_B^b}\approx\frac{[C]^c[D]^d}{[A]^a[B]^b}$$

Sólidos e solvente puros têm atividade 1. Somar reações multiplica as constantes; inverter uma reação inverte $K$.`,
      },
      {
        heading: "Atividade e força iônica",
        body: r`Em soluções reais, íons são "blindados" pela atmosfera iônica: $a_i = \gamma_i[i]$.

$$\mu = \frac12\sum c_iz_i^2 \qquad \log\gamma=\frac{-0{,}51\,z^2\sqrt\mu}{1+\alpha\sqrt\mu/305}$$

($\alpha$ em pm). Consequências: **efeito salino** — a solubilidade de sais pouco solúveis **aumenta** com a força iônica; o pH medido difere de $-\log[\text{H}^+]$.`,
      },
    ],
    formulas: [
      { label: "Força iônica", tex: r`\mu=\tfrac12\textstyle\sum c_iz_i^2` },
      { label: "Debye-Hückel estendida", tex: r`\log\gamma=\frac{-0{,}51z^2\sqrt\mu}{1+\alpha\sqrt\mu/305}` },
    ],
    tools: [{ to: "/calculadoras/atividade", label: "Força iônica e atividade", kind: "calculadora" }],
    refs: "Harris, cap. 6 e 8; Skoog, cap. 9-10.",
  },
  {
    id: "q-acidobase",
    level: 3,
    title: "pH de ácidos e bases",
    summary: "Ácidos/bases fortes e fracos: das aproximações de prova à solução exata pelo balanço de carga.",
    objectives: ["Calcular pH de ácidos/bases fortes, inclusive muito diluídos", "Calcular pH de ácidos/bases fracos (com e sem aproximação)", "Usar balanço de massa e de carga"],
    theory: [
      {
        heading: "Fortes",
        body: r`Ionização completa: $\text{pH} = -\log c$ (ácido) e $\text{pOH} = -\log c$ (base). Para $c < 10^{-6}$ M a autoionização da água importa:

$$[\text{H}^+] = \frac{c+\sqrt{c^2+4K_w}}{2}$$

(HCl $10^{-8}$ M tem pH 6,98 — e não 8!)`,
      },
      {
        heading: "Fracos",
        body: r`$\text{HA} \rightleftharpoons \text{H}^+ + \text{A}^-$, com $x = [\text{H}^+]$:

$$K_a=\frac{x^2}{c-x}\ \Rightarrow\ x=\frac{-K_a+\sqrt{K_a^2+4K_ac}}{2}$$

**Aproximação** ($x \ll c$, válida se $c/K_a > 100$ ou ionização < 5 %): $[\text{H}^+] \approx \sqrt{K_ac}$.

Bases fracas: mesmo raciocínio com $K_b = K_w/K_a$ e $x = [\text{OH}^-]$.`,
      },
      {
        heading: "Tratamento sistemático",
        body: r`Para qualquer sistema: escreva (1) as reações, (2) o **balanço de carga** (Σ cargas + = Σ cargas −), (3) os **balanços de massa**, (4) as constantes; então resolva. Este app resolve o balanço de carga numericamente — por isso calcula pH exato de qualquer mistura.

$$[\text{H}^+] + [\text{Na}^+] = [\text{OH}^-] + [\text{A}^-] \qquad c_\text{HA} = [\text{HA}] + [\text{A}^-]$$`,
      },
    ],
    formulas: [
      { label: "Ácido fraco", tex: r`[\text{H}^+]\approx\sqrt{K_ac}` },
      { label: "Base fraca", tex: r`[\text{OH}^-]\approx\sqrt{K_bc}` },
      { label: "Grau de ionização", tex: r`\alpha=\frac{[\text{A}^-]}{c}` },
    ],
    tools: [
      { to: "/calculadoras/ph", label: "pH exato com passo a passo", kind: "calculadora" },
      { to: "/simuladores/especies", label: "Distribuição de espécies", kind: "simulador" },
    ],
    refs: "Harris, cap. 8-10; Skoog, cap. 9.",
  },
  {
    id: "q-tampao",
    level: 3,
    title: "Tampões e capacidade tamponante",
    summary: "Henderson-Hasselbalch, preparo de tampões e por que o tampão resiste à adição de ácido.",
    objectives: ["Calcular pH de tampões", "Calcular variação de pH após adição de ácido/base forte", "Projetar tampão para um pH alvo"],
    theory: [
      {
        heading: "Henderson-Hasselbalch",
        body: r`$$\text{pH} = \text{p}K_a + \log\frac{[\text{A}^-]}{[\text{HA}]}$$

Válida quando as concentrações do par são muito maiores que $[\text{H}^+]$ e $[\text{OH}^-]$. A região útil é $\text{p}K_a \pm 1$.

**Adição de ácido forte** ($n_\text{H}$ mol): $\text{A}^- \to \text{HA}$. Novo pH:
$$\text{pH}=\text{p}K_a+\log\frac{n_{\text{A}^-}-n_\text{H}}{n_\text{HA}+n_\text{H}}$$`,
      },
      {
        heading: "Capacidade tamponante",
        body: r`$$\beta = \frac{dc_b}{d\text{pH}} = 2{,}303\left([\text{H}^+]+[\text{OH}^-]+\frac{c\,K_a[\text{H}^+]}{(K_a+[\text{H}^+])^2}\right)$$

É máxima em $\text{pH} = \text{p}K_a$ e proporcional à concentração total do tampão. A **diluição** praticamente não altera o pH, mas reduz $\beta$.`,
      },
    ],
    formulas: [
      { label: "H-H", tex: r`\text{pH}=\text{p}K_a+\log\frac{[\text{A}^-]}{[\text{HA}]}` },
      { label: "Capacidade", tex: r`\beta_\text{máx}\approx0{,}576\,c` },
    ],
    tools: [{ to: "/calculadoras/ph", label: "Calculadora de tampão", kind: "calculadora" }],
    refs: "Harris, cap. 9; Skoog, cap. 9.",
  },
  {
    id: "q-poliprotico",
    level: 3,
    title: "Sistemas polipróticos e frações α",
    summary: "H₃PO₄, H₂CO₃, aminoácidos: anfipróticos, frações de distribuição e diagramas de espécies.",
    objectives: ["Calcular frações αᵢ em função do pH", "Calcular pH de espécies anfipróticas", "Ler diagramas de distribuição"],
    theory: [
      {
        heading: "Frações de distribuição",
        body: r`Para um ácido diprótico $\text{H}_2\text{A}$:

$$\alpha_{\text{H}_2\text{A}}=\frac{[\text{H}^+]^2}{D},\quad \alpha_{\text{HA}^-}=\frac{K_1[\text{H}^+]}{D},\quad \alpha_{\text{A}^{2-}}=\frac{K_1K_2}{D}$$
$$D=[\text{H}^+]^2+K_1[\text{H}^+]+K_1K_2$$

Nos pontos $\text{pH}=\text{p}K_i$ duas espécies vizinhas têm frações iguais.`,
      },
      {
        heading: "Espécie anfiprótica",
        body: r`$\text{HA}^-$ pode doar e receber próton. Para concentração não muito baixa:

$$[\text{H}^+]\approx\sqrt{\frac{K_1K_2c+K_1K_w}{K_1+c}}\ \approx\ \sqrt{K_1K_2}\quad\Rightarrow\quad \text{pH}\approx\frac{\text{p}K_1+\text{p}K_2}{2}$$

NaHCO₃: pH ≈ (6,35 + 10,33)/2 = 8,34.`,
      },
    ],
    formulas: [
      { label: "Anfiprótico", tex: r`\text{pH}\approx\tfrac{\text{p}K_1+\text{p}K_2}{2}` },
      { label: "Fração genérica", tex: r`\alpha_j=\frac{[\text{H}^+]^{n-j}\prod_{i\le j}K_i}{D}` },
    ],
    tools: [
      { to: "/simuladores/especies", label: "Diagrama de espécies animado", kind: "simulador" },
      { to: "/calculadoras/ph", label: "pH de polipróticos (exato)", kind: "calculadora" },
    ],
    refs: "Harris, cap. 10-11; Skoog, cap. 15.",
  },
  {
    id: "q-solubilidade",
    level: 3,
    title: "Solubilidade e Kps",
    summary: "Solubilidade molar, efeito do íon comum, precipitação seletiva e influência do pH.",
    objectives: ["Relacionar s e Kps para sais MₐXᵦ", "Calcular solubilidade com íon comum", "Prever precipitação (Q × Kps)"],
    theory: [
      {
        heading: "Kps e solubilidade",
        body: r`Para $\text{M}_a\text{X}_b(s) \rightleftharpoons a\text{M}^{b+} + b\text{X}^{a-}$:

$$K_{ps}=[\text{M}]^a[\text{X}]^b=(as)^a(bs)^b\ \Rightarrow\ s=\sqrt[a+b]{\frac{K_{ps}}{a^ab^b}}$$

AgCl: $s = \sqrt{K_{ps}}$; Ag₂CrO₄: $s=\sqrt[3]{K_{ps}/4}$. **Compare solubilidades, não Kps**, quando a estequiometria difere.`,
      },
      {
        heading: "Íon comum, Q e pH",
        body: r`**Íon comum** reduz a solubilidade: AgCl em NaCl 0,10 M → $s \approx K_{ps}/0{,}10 = 1{,}8\times10^{-9}$ M.

**Precipita?** Calcule o quociente $Q$ com as concentrações após a mistura: $Q > K_{ps}$ → precipita.

**pH:** sais de ânions básicos (CO₃²⁻, C₂O₄²⁻, F⁻, OH⁻, S²⁻) são mais solúveis em meio ácido, pois o ânion é protonado e o equilíbrio se desloca.`,
      },
    ],
    formulas: [
      { label: "Sal 1:1", tex: r`s=\sqrt{K_{ps}}` },
      { label: "Sal genérico", tex: r`s=\left(\frac{K_{ps}}{a^ab^b}\right)^{1/(a+b)}` },
      { label: "Precipitação", tex: r`Q>K_{ps}` },
    ],
    tools: [{ to: "/calculadoras/solubilidade", label: "Solubilidade e íon comum", kind: "calculadora" }],
    refs: "Harris, cap. 6; Skoog, cap. 9 e 11.",
  },

  /* ============================ NÍVEL 4 ============================ */
  {
    id: "c-neutralizacao",
    level: 4,
    title: "Volumetria de neutralização",
    summary: "Curvas de titulação ácido-base, escolha de indicador, polipróticos e erro de titulação.",
    objectives: ["Calcular pH em cada região da curva", "Escolher indicador pelo salto de pH", "Interpretar titulações de polipróticos e misturas"],
    theory: [
      {
        heading: "As quatro regiões (ácido fraco + base forte)",
        body: r`1. **Início:** pH do ácido fraco, $[\text{H}^+]\approx\sqrt{K_ac}$.
2. **Antes do PE:** tampão — $\text{pH}=\text{p}K_a+\log\dfrac{n_\text{OH}}{n_\text{HA}-n_\text{OH}}$. No meio do caminho, $\text{pH}=\text{p}K_a$.
3. **No PE:** solução de $\text{A}^-$: $[\text{OH}^-]=\sqrt{K_bc_{\text{A}^-}}$ → pH > 7.
4. **Após o PE:** excesso de base forte domina.

Ácido forte + base forte: PE em pH 7,00 e salto muito maior.`,
      },
      {
        heading: "Indicadores",
        body: r`Escolha um indicador cuja faixa de viragem ($\text{p}K_\text{In}\pm1$) esteja **dentro do salto vertical** da curva.

| Indicador | Faixa | Uso típico |
|---|---|---|
| Alaranjado de metila | 3,1–4,4 | base fraca + ácido forte |
| Vermelho de metila | 4,4–6,2 | base fraca + ácido forte |
| Azul de bromotimol | 6,0–7,6 | forte + forte |
| Fenolftaleína | 8,2–10,0 | ácido fraco + base forte |

O salto encolhe quando $K_a$ ou $c$ diminuem; ácidos com $K_a c < 10^{-8}$ não dão ponto final nítido em água.`,
      },
      {
        heading: "Polipróticos e misturas",
        body: r`Saltos distintos aparecem quando $K_1/K_2 > 10^4$. H₃PO₄ mostra dois saltos (o 3º, de pKa 12,4, não é visível). **Mistura carbonato/bicarbonato (Warder):** fenolftaleína marca CO₃²⁻ → HCO₃⁻; alaranjado de metila marca HCO₃⁻ → H₂CO₃.`,
      },
    ],
    formulas: [
      { label: "Meia equivalência", tex: r`V=\tfrac12V_\text{PE}\Rightarrow\text{pH}=\text{p}K_a` },
      { label: "No PE (ácido fraco)", tex: r`[\text{OH}^-]=\sqrt{\tfrac{K_w}{K_a}c_{\text{A}^-}}` },
    ],
    tools: [
      { to: "/simuladores/titulacao", label: "Titulação animada com indicador", kind: "simulador" },
      { to: "/simuladores/curvas", label: "Comparador de curvas", kind: "simulador" },
      { to: "/laboratorio", label: "Ponto final por derivadas (seus dados)", kind: "laboratório" },
    ],
    refs: "Harris, cap. 11; Skoog, cap. 14-15.",
  },
  {
    id: "c-precipitacao",
    level: 4,
    title: "Volumetria de precipitação",
    summary: "Argentometria: métodos de Mohr, Volhard e Fajans; curvas pAg e titulação de misturas.",
    objectives: ["Calcular pAg ao longo da titulação", "Comparar métodos de detecção do ponto final", "Analisar misturas de haletos"],
    theory: [
      {
        heading: "Curva de titulação",
        body: r`Cl⁻ titulado com Ag⁺:
- Antes do PE: $[\text{Cl}^-]$ = excesso de cloreto; $[\text{Ag}^+]=K_{ps}/[\text{Cl}^-]$.
- No PE: $[\text{Ag}^+]=\sqrt{K_{ps}}$ → pAg = 4,87 (AgCl).
- Após o PE: $[\text{Ag}^+]$ = excesso de prata.

Quanto menor o $K_{ps}$, maior o salto: AgI > AgBr > AgCl.`,
      },
      {
        heading: "Métodos de detecção",
        body: r`| Método | Indicador | Princípio | Meio |
|---|---|---|---|
| **Mohr** | CrO₄²⁻ | precipita Ag₂CrO₄ vermelho após o PE | pH 7–10 |
| **Volhard** | Fe³⁺ | retrotitulação do excesso de Ag⁺ com SCN⁻; forma FeSCN²⁺ vermelho | ácido (HNO₃) |
| **Fajans** | fluoresceína/eosina | adsorção do indicador na superfície do precipitado | depende do indicador |

No Volhard para Cl⁻, filtre o AgCl ou adicione nitrobenzeno, pois AgCl é mais solúvel que AgSCN.`,
      },
    ],
    formulas: [
      { label: "No PE", tex: r`[\text{Ag}^+]=\sqrt{K_{ps}}` },
      { label: "Antes do PE", tex: r`\text{pAg}=\text{p}K_{ps}-\text{pCl}` },
    ],
    tools: [{ to: "/simuladores/curvas", label: "Curvas de precipitação", kind: "simulador" }],
    refs: "Skoog, cap. 17; Harris, cap. 7 e 26.",
  },
  {
    id: "c-complexometria",
    level: 4,
    title: "Complexometria com EDTA",
    summary: "Constante condicional, αY⁴⁻, curvas pM, indicadores metalocrômicos e dureza da água.",
    objectives: ["Calcular K'f = αY⁴⁻·Kf", "Calcular pM nas regiões da curva", "Calcular dureza da água e teores de metais"],
    theory: [
      {
        heading: "EDTA e constante condicional",
        body: r`O EDTA (H₄Y, ligante hexadentado) forma complexos **1:1** com quase todos os metais. Como só $\text{Y}^{4-}$ complexa e sua fração depende do pH:

$$K_f' = \alpha_{\text{Y}^{4-}}K_f = \frac{[\text{MY}^{n-4}]}{[\text{M}^{n+}]\,c_\text{EDTA}}$$

$\alpha_{\text{Y}^{4-}}$ ≈ 0,30 em pH 10; 3,8 × 10⁻⁴ em pH 7. Metais com $K_f$ pequeno (Ca²⁺, Mg²⁺) exigem pH alto (tampão NH₃/NH₄⁺ pH 10).`,
      },
      {
        heading: "Curva e indicadores",
        body: r`- Antes do PE: $[\text{M}]$ = metal em excesso (corrigido pela diluição).
- No PE: $[\text{M}] = \sqrt{c_{\text{MY}}/K_f'}$.
- Após o PE: $[\text{M}] = \dfrac{[\text{MY}]}{K_f'\,c_{\text{EDTA, excesso}}}$.

**Negro de eriocromo T (Erio T):** vinho quando ligado ao metal, azul livre (pH 10). **Murexida** para Ca²⁺ em pH 12 (Mg precipita como Mg(OH)₂).

**Dureza da água:** expressa como mg/L de CaCO₃: $\text{dureza} = \dfrac{c_\text{EDTA}V_\text{EDTA}\cdot100{,}09\cdot1000}{V_\text{amostra}}$.`,
      },
    ],
    formulas: [
      { label: "Constante condicional", tex: r`K_f'=\alpha_{\text{Y}^{4-}}K_f` },
      { label: "No PE", tex: r`[\text{M}]=\sqrt{c_\text{MY}/K_f'}` },
      { label: "Dureza", tex: r`\text{mg CaCO}_3/\text{L}=\frac{c_YV_Y\,100{,}09\times1000}{V_a}` },
    ],
    tools: [{ to: "/simuladores/curvas", label: "Curva EDTA (pH ajustável)", kind: "simulador" }],
    refs: "Harris, cap. 12; Skoog, cap. 17.",
  },
  {
    id: "c-redox",
    level: 4,
    title: "Volumetria de oxirredução",
    summary: "Curvas de potencial, potencial no PE, permanganometria, dicromatometria e iodometria.",
    objectives: ["Calcular E ao longo da titulação via Nernst", "Calcular E no ponto de equivalência", "Balancear e aplicar a estequiometria de MnO₄⁻, Cr₂O₇²⁻ e I₂"],
    theory: [
      {
        heading: "Curva de titulação (Fe²⁺ com Ce⁴⁺)",
        body: r`- Antes do PE, use o par do analito: $E = E^\circ_{\text{Fe}} - 0{,}05916\log\dfrac{[\text{Fe}^{2+}]}{[\text{Fe}^{3+}]}$. Na metade, $E = E^\circ_{\text{Fe}}$.
- Após o PE, use o par do titulante: $E = E^\circ_{\text{Ce}} - 0{,}05916\log\dfrac{[\text{Ce}^{3+}]}{[\text{Ce}^{4+}]}$. Em $2V_\text{PE}$, $E = E^\circ_\text{Ce}$.
- No PE:
$$E_\text{PE}=\frac{n_1E_1^\circ+n_2E_2^\circ}{n_1+n_2}$$`,
      },
      {
        heading: "Principais métodos",
        body: r`- **Permanganometria:** $\text{MnO}_4^- + 8\text{H}^+ + 5e^- \to \text{Mn}^{2+} + 4\text{H}_2\text{O}$. Autoindicador (rosa). Padronizado com Na₂C₂O₄ (2 MnO₄⁻ : 5 C₂O₄²⁻).
- **Dicromatometria:** $\text{Cr}_2\text{O}_7^{2-} + 14\text{H}^+ + 6e^- \to 2\text{Cr}^{3+}$. Padrão primário; indicador difenilaminossulfonato.
- **Iodometria:** analito oxidante + excesso de I⁻ → I₂, titulado com tiossulfato ($\text{I}_2 + 2\text{S}_2\text{O}_3^{2-}\to 2\text{I}^- + \text{S}_4\text{O}_6^{2-}$); amido adicionado perto do fim.
- **Iodimetria:** titulação direta com I₂ de redutores (ex.: vitamina C).`,
      },
    ],
    formulas: [
      { label: "Nernst", tex: r`E=E^\circ-\frac{0{,}05916}{n}\log Q` },
      { label: "Potencial no PE", tex: r`E_\text{PE}=\frac{n_1E_1^\circ+n_2E_2^\circ}{n_1+n_2}` },
      { label: "K a partir de E°", tex: r`\log K=\frac{n\Delta E^\circ}{0{,}05916}` },
    ],
    tools: [
      { to: "/simuladores/curvas", label: "Curvas redox", kind: "simulador" },
      { to: "/calculadoras/nernst", label: "Nernst e células", kind: "calculadora" },
    ],
    refs: "Harris, cap. 15-16; Skoog, cap. 18-20.",
  },
  {
    id: "c-gravimetria",
    level: 4,
    title: "Análise gravimétrica",
    summary: "Precipitação, digestão, calcinação e fator gravimétrico; supersaturação relativa e contaminação.",
    objectives: ["Calcular com fator gravimétrico", "Explicar como obter precipitados filtráveis (Von Weimarn)", "Identificar coprecipitação e oclusão"],
    theory: [
      {
        heading: "Fator gravimétrico",
        body: r`$$m_\text{analito}=m_\text{precipitado}\times\underbrace{\frac{a\,M_\text{analito}}{b\,M_\text{precipitado}}}_{\text{FG}}$$

$a$ e $b$ igualam o elemento comum. Fe em Fe₂O₃: $\text{FG} = \dfrac{2\times55{,}845}{159{,}69} = 0{,}6994$.`,
      },
      {
        heading: "Formação de bons precipitados",
        body: r`**Supersaturação relativa (Von Weimarn):** $\text{SR} = \dfrac{Q-S}{S}$. SR alta → nucleação → partículas pequenas (coloides). Para cristais grandes: soluções diluídas e quentes, adição lenta com agitação, e controle de pH.

**Digestão** (aquecer em contato com a água-mãe) aumenta o tamanho das partículas e expulsa impurezas. **Precipitação homogênea** (ex.: ureia gerando OH⁻ lentamente) mantém SR baixa.

**Contaminação:** adsorção superficial, inclusão (cristal misto), oclusão. Reprecipitação reduz contaminantes.`,
      },
    ],
    formulas: [
      { label: "Fator gravimétrico", tex: r`\text{FG}=\frac{a\,M_\text{analito}}{b\,M_\text{ppt}}` },
      { label: "Teor", tex: r`\%=\frac{m_\text{ppt}\cdot\text{FG}}{m_\text{amostra}}\times100` },
      { label: "Von Weimarn", tex: r`\text{SR}=\frac{Q-S}{S}` },
    ],
    tools: [{ to: "/calculadoras/gravimetria", label: "Gravimetria passo a passo", kind: "calculadora" }],
    refs: "Skoog, cap. 12; Harris, cap. 26.",
  },

  /* ============================ NÍVEL 5 ============================ */
  {
    id: "i-espectro",
    level: 5,
    title: "Espectrofotometria UV-Vis",
    summary: "Lei de Beer-Lambert, desvios, instrumentação, curva analítica e misturas de dois componentes.",
    objectives: ["Aplicar A = εbc e converter T ↔ A", "Escolher λmáx e faixa de trabalho", "Resolver misturas por aditividade de absorbâncias"],
    theory: [
      {
        heading: "Beer-Lambert",
        body: r`$$A = -\log T = -\log\frac{P}{P_0} = \varepsilon\,b\,c$$

$\varepsilon$ (L mol⁻¹ cm⁻¹) é a absortividade molar, $b$ o caminho óptico (cm). A cor observada é a **complementar** da absorvida (KMnO₄ absorve verde, ~525 nm, e parece púrpura).

**Desvios:** reais (c > 0,01 M, interações), químicos (equilíbrios de associação/dissociação) e instrumentais (radiação policromática, luz espúria). A faixa de A ≈ 0,2–0,8 minimiza o erro relativo em c.`,
      },
      {
        heading: "Misturas",
        body: r`Absorbâncias são **aditivas**. Para X e Y medidos em $\lambda_1$ e $\lambda_2$:

$$A_1=\varepsilon_{X1}bc_X+\varepsilon_{Y1}bc_Y\qquad A_2=\varepsilon_{X2}bc_X+\varepsilon_{Y2}bc_Y$$

Resolve-se o sistema 2×2. Escolha comprimentos de onda onde as espécies absorvem de forma bem diferente.

**Instrumentação:** fonte (D₂ para UV, W/halogênio para visível) → monocromador → cubeta (quartzo no UV) → detector (fotodiodo/PMT).`,
      },
    ],
    formulas: [
      { label: "Beer", tex: r`A=\varepsilon bc` },
      { label: "Transmitância", tex: r`A=2-\log(\%T)` },
      { label: "Mistura", tex: r`A_\lambda=\textstyle\sum\varepsilon_{i\lambda}bc_i` },
    ],
    tools: [
      { to: "/simuladores/espectro", label: "Espectrofotômetro virtual", kind: "simulador" },
      { to: "/calculadoras/beer", label: "Beer e mistura de dois componentes", kind: "calculadora" },
      { to: "/laboratorio", label: "Curva analítica com seus dados", kind: "laboratório" },
    ],
    refs: "Skoog, cap. 24-26; Harris, cap. 17-18.",
  },
  {
    id: "i-potenciometria",
    level: 5,
    title: "Eletroquímica e potenciometria",
    summary: "Células galvânicas, Nernst, eletrodos de referência, eletrodo de vidro e íon-seletivos.",
    objectives: ["Calcular E de célula e espontaneidade (ΔG)", "Explicar o funcionamento do eletrodo de vidro", "Aplicar a equação de Nikolsky-Eisenman"],
    theory: [
      {
        heading: "Células e Nernst",
        body: r`$$E_\text{cel}=E_\text{cátodo}-E_\text{ânodo}\qquad \Delta G=-nFE\qquad E=E^\circ-\frac{0{,}05916}{n}\log Q\ (25\,^\circ\text{C})$$

$E_\text{cel} > 0$ → espontânea. Eletrodos de referência: **Ag/AgCl** (KCl sat., +0,197 V vs EPH) e **calomelano saturado** (+0,241 V).`,
      },
      {
        heading: "Eletrodos indicadores",
        body: r`**Eletrodo de vidro:** a membrana troca H⁺ nas camadas hidratadas; $E = \text{const} - 0{,}05916\,\text{pH}$ (59,16 mV por unidade de pH a 25 °C). Erros: **alcalino** (resposta a Na⁺ em pH > 11, leitura baixa) e **ácido** (pH < 0,5, leitura alta). Calibra-se com 2+ tampões padrão.

**Íon-seletivos:** $E = K + \dfrac{0{,}05916}{z}\log\left(a_i + \sum k_{ij}a_j^{z_i/z_j}\right)$ (Nikolsky-Eisenman); $k_{ij}$ pequeno = boa seletividade.

**Titulação potenciométrica:** o ponto final é o máximo da 1ª derivada ($\Delta E/\Delta V$) ou o zero da 2ª derivada.`,
      },
    ],
    formulas: [
      { label: "Nernst", tex: r`E=E^\circ-\tfrac{0{,}05916}{n}\log Q` },
      { label: "ΔG", tex: r`\Delta G^\circ=-nFE^\circ` },
      { label: "Eletrodo de vidro", tex: r`E=K-0{,}05916\,\text{pH}` },
    ],
    tools: [
      { to: "/calculadoras/nernst", label: "Célula eletroquímica", kind: "calculadora" },
      { to: "/laboratorio", label: "Titulação potenciométrica (derivadas)", kind: "laboratório" },
    ],
    refs: "Harris, cap. 13-15; Skoog, cap. 18 e 21.",
  },
  {
    id: "i-cromatografia",
    level: 5,
    title: "Cromatografia (GC e HPLC)",
    summary: "Retenção, eficiência, seletividade e resolução; equação de van Deemter e de Purnell.",
    objectives: ["Calcular k, α, N, H e Rs a partir do cromatograma", "Otimizar resolução pela equação de Purnell", "Interpretar a curva de van Deemter"],
    theory: [
      {
        heading: "Parâmetros",
        body: r`$$k=\frac{t_R-t_M}{t_M}\qquad \alpha=\frac{k_2}{k_1}\qquad N=16\left(\frac{t_R}{w_b}\right)^2=5{,}54\left(\frac{t_R}{w_{1/2}}\right)^2\qquad H=\frac{L}{N}$$

$$R_s=\frac{2(t_{R2}-t_{R1})}{w_1+w_2}$$

$R_s = 1{,}5$ é separação de linha de base (≈ 99,7 %).`,
      },
      {
        heading: "Otimização",
        body: r`**Purnell:** $R_s=\dfrac{\sqrt N}{4}\left(\dfrac{\alpha-1}{\alpha}\right)\left(\dfrac{k_2}{1+k_2}\right)$. Dobrar $N$ multiplica $R_s$ por apenas $\sqrt2$; mudar $\alpha$ (fase móvel/estacionária) é muito mais eficaz.

**van Deemter:** $H = A + \dfrac{B}{u} + Cu$ — A: caminhos múltiplos; B: difusão longitudinal; C: transferência de massa. Vazão ótima $u_\text{ót}=\sqrt{B/C}$.

**Quantificação:** área do pico ∝ quantidade; padronização interna corrige variações de injeção.`,
      },
    ],
    formulas: [
      { label: "Resolução", tex: r`R_s=\frac{2\Delta t_R}{w_1+w_2}` },
      { label: "Purnell", tex: r`R_s=\tfrac{\sqrt N}{4}\tfrac{\alpha-1}{\alpha}\tfrac{k_2}{1+k_2}` },
      { label: "van Deemter", tex: r`H=A+\tfrac Bu+Cu` },
    ],
    tools: [
      { to: "/simuladores/cromatografia", label: "Cromatógrafo animado", kind: "simulador" },
      { to: "/calculadoras/cromatografia", label: "Parâmetros cromatográficos", kind: "calculadora" },
    ],
    refs: "Skoog, cap. 31-33; Harris, cap. 23-25.",
  },
];

export const TOPIC_BY_ID: Record<string, Topic> = Object.fromEntries(TOPICS.map((t) => [t.id, t]));
export const topicsOfLevel = (l: LevelId) => TOPICS.filter((t) => t.level === l);
