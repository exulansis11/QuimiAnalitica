/**
 * Questões conceituais de múltipla escolha no estilo de provas de graduação
 * (Química Analítica I/II, Análise Instrumental). Questões ORIGINAIS, elaboradas
 * a partir dos tópicos clássicos de Skoog, Harris, Baccan e Vogel.
 *
 * Formato compacto: [tópico, dificuldade, enunciado, CORRETA, [erradas], explicação]
 * A ordem das alternativas é embaralhada em tempo de execução.
 */
import type { Difficulty } from "./types";

export type ConceptualRaw = [string, Difficulty, string, string, string[], string];

export const CONCEPTUAL: ConceptualRaw[] = [
  /* ---------------- m-cientifica ---------------- */
  ["m-cientifica", 1, "Qual é a forma correta de 0,000 078 0 em notação científica?", "7,80 × 10⁻⁵", ["7,8 × 10⁻⁴", "78,0 × 10⁻⁶", "7,80 × 10⁵"], "A vírgula anda 5 casas para a direita (expoente −5); os zeros finais após a vírgula são significativos e devem ser mantidos (7,80)."],
  ["m-cientifica", 2, "O Kps do AgCl é 1,8 × 10⁻¹⁰. A ordem de grandeza de √Kps é:", "10⁻⁵", ["10⁻¹⁰", "10⁻²⁰", "10⁻⁴"], "√(10⁻¹⁰) = 10⁻⁵; com a mantissa: √1,8 ≈ 1,34, logo s ≈ 1,3 × 10⁻⁵ mol/L."],
  ["m-cientifica", 1, "(2,0 × 10³) × (3,0 × 10⁻⁵) é igual a:", "6,0 × 10⁻²", ["6,0 × 10⁸", "6,0 × 10⁻¹⁵", "5,0 × 10⁻²"], "Multiplicam-se as mantissas (6,0) e somam-se os expoentes (3 − 5 = −2)."],
  ["m-cientifica", 2, "Para somar 4,5 × 10⁻³ + 3,0 × 10⁻⁴ deve-se primeiro:", "Igualar os expoentes e então somar as mantissas", ["Somar os expoentes", "Multiplicar as mantissas", "Somar mantissas e expoentes separadamente"], "4,5 × 10⁻³ + 0,30 × 10⁻³ = 4,8 × 10⁻³."],

  /* ---------------- m-algarismos ---------------- */
  ["m-algarismos", 1, "Uma bureta de 50 mL com graduação de 0,1 mL deve ser lida como:", "23,45 mL", ["23,4 mL", "23 mL", "23,450 mL"], "Lê-se até a menor divisão (0,1) e estima-se mais um dígito (centésimos)."],
  ["m-algarismos", 2, "O resultado de 12,11 + 18,0 + 1,013 com algarismos significativos corretos é:", "31,1", ["31,123", "31,12", "31"], "Na soma, o resultado tem o número de casas decimais do termo com menos casas (18,0 → 1 casa)."],
  ["m-algarismos", 2, "Se [H⁺] = 3,7 × 10⁻⁵ mol/L, o pH corretamente expresso é:", "4,43", ["4,4", "4,432", "4,4318"], "Dois significativos na concentração → duas casas decimais no pH (a característica '4' apenas posiciona a vírgula)."],
  ["m-algarismos", 3, "Qual prática MINIMIZA erros de arredondamento num cálculo com várias etapas?", "Manter dígitos extras nas etapas intermediárias e arredondar só o resultado final", ["Arredondar cada etapa para 2 significativos", "Truncar os valores na 3ª casa decimal", "Usar sempre 2 casas decimais"], "Arredondamentos sucessivos acumulam erro; o arredondamento deve ser feito apenas no final."],

  /* ---------------- m-log ---------------- */
  ["m-log", 1, "Uma solução de pH 3 tem [H⁺] quantas vezes maior que uma de pH 5?", "100", ["2", "10", "1000"], "Cada unidade de pH equivale a fator 10: 10^(5−3) = 100."],
  ["m-log", 2, "Num tampão, dobrar a razão [A⁻]/[HA] faz o pH:", "Aumentar cerca de 0,30", ["Dobrar", "Aumentar 1 unidade", "Diminuir cerca de 0,30"], "pH = pKa + log(razão); log 2 = 0,301."],
  ["m-log", 1, "Se pKa = 4,76, então Ka é:", "1,7 × 10⁻⁵", ["4,76 × 10⁻¹", "5,8 × 10⁴", "1,7 × 10⁵"], "Ka = 10^(−4,76) = 1,74 × 10⁻⁵."],
  ["m-log", 2, "Uma absorbância A = 1,0 corresponde a uma transmitância de:", "10 %", ["1 %", "90 %", "50 %"], "A = −log T → T = 10⁻¹ = 0,10."],
  ["m-log", 3, "log(a/b²) é igual a:", "log a − 2 log b", ["log a / (2 log b)", "2 log a − log b", "log a − log 2b"], "Propriedades: log(x/y) = log x − log y e log yⁿ = n log y."],

  /* ---------------- m-unidades ---------------- */
  ["m-unidades", 1, "1 mmol/mL equivale a:", "1 mol/L", ["1 mmol/L", "1000 mol/L", "1 µmol/L"], "Numerador e denominador são divididos pelo mesmo fator 10³."],
  ["m-unidades", 1, "250 µL correspondem a:", "0,250 mL", ["2,50 mL", "0,0250 mL", "25,0 mL"], "1 µL = 10⁻³ mL."],
  ["m-unidades", 2, "Uma solução aquosa diluída com 5 ppm de Pb contém:", "5 mg de Pb por litro", ["5 g de Pb por litro", "5 µg de Pb por litro", "5 mg de Pb por mL"], "Para soluções aquosas diluídas, 1 ppm ≈ 1 mg/L = 1 µg/mL."],
  ["m-unidades", 2, "Ao dividir mg por g/mol, obtém-se:", "mmol", ["mol", "µmol", "g"], "mg / (mg/mmol) = mmol, porque g/mol = mg/mmol."],

  /* ---------------- m-proporcao ---------------- */
  ["m-proporcao", 1, "Um comprimido rotulado com 500 mg apresentou 485 mg de princípio ativo. O teor em relação ao rotulado é:", "97,0 %", ["3,0 %", "103 %", "98,5 %"], "485/500 × 100 = 97,0 %."],
  ["m-proporcao", 2, "Se a absorbância é proporcional à concentração e uma solução 2,0 mg/L dá A = 0,150, uma amostra com A = 0,450 tem:", "6,0 mg/L", ["3,0 mg/L", "0,67 mg/L", "4,5 mg/L"], "Proporção direta: c = 2,0 × 0,450/0,150 = 6,0 mg/L."],
  ["m-proporcao", 2, "Erro relativo de +2,0 % significa que o resultado foi:", "2,0 % maior que o valor verdadeiro", ["2,0 % menor que o verdadeiro", "Preciso em 2,0 %", "Com desvio padrão de 2,0 %"], "Erro relativo = (medido − verdadeiro)/verdadeiro; o sinal positivo indica resultado acima."],

  /* ---------------- f-mol ---------------- */
  ["f-mol", 1, "Quantos mols de íons há em 1 mol de Al₂(SO₄)₃ completamente dissociado?", "5 mol", ["2 mol", "3 mol", "17 mol"], "Al₂(SO₄)₃ → 2 Al³⁺ + 3 SO₄²⁻: 2 + 3 = 5 mol de íons."],
  ["f-mol", 2, "Na reação 2MnO₄⁻ + 5H₂O₂ + 6H⁺ → 2Mn²⁺ + 5O₂ + 8H₂O, 0,40 mmol de MnO₄⁻ reagem com quantos mmol de H₂O₂?", "1,0 mmol", ["0,40 mmol", "0,16 mmol", "2,0 mmol"], "Razão 5/2: 0,40 × 5/2 = 1,0 mmol."],
  ["f-mol", 2, "A massa molar do CuSO₄·5H₂O (≈ 249,7 g/mol) é maior que a do CuSO₄ (≈ 159,6 g/mol) porque:", "Inclui 5 moléculas de água de cristalização (≈ 90,1 g/mol)", ["Cu está em estado de oxidação maior", "O hidrato tem mais sulfato", "A água aumenta a massa atômica do Cu"], "5 × 18,015 = 90,08 g/mol de água de hidratação."],
  ["f-mol", 3, "Ao pesar um sal higroscópico sem secagem prévia para preparar um padrão, o erro na concentração calculada será:", "Positivo (concentração calculada maior que a real)", ["Negativo", "Nulo, se a pesagem for rápida", "Aleatório"], "Parte da massa pesada é água; há menos soluto do que se supõe, então a concentração real é menor que a calculada."],

  /* ---------------- f-conc ---------------- */
  ["f-conc", 1, "Uma solução de NaCl 0,9 % (m/v) contém:", "0,9 g de NaCl em 100 mL de solução", ["0,9 g em 100 g de água", "0,9 mol em 100 mL", "9 g em 100 mL"], "% m/v = gramas de soluto por 100 mL de solução."],
  ["f-conc", 2, "Numa solução de ácido acético 0,10 M, a concentração ANALÍTICA de HOAc é:", "0,10 M, independentemente da ionização", ["Menor que 0,10 M, pois parte ionizou", "Igual a [H⁺]", "Igual a [OAc⁻]"], "Concentração analítica é a quantidade total adicionada; a de equilíbrio [HOAc] é ligeiramente menor."],
  ["f-conc", 2, "Para reagentes comerciais, a molaridade é calculada por c = 1000·d·w/M. O termo 1000·d representa:", "A massa (g) de 1 L de solução", ["A massa de soluto em 1 L", "O volume de 1 kg de solução", "A massa de água em 1 L"], "d em g/mL × 1000 mL = massa de 1 L de solução; multiplica-se por w (fração mássica) para obter o soluto."],
  ["f-conc", 3, "Comparando mol/L e mol/kg (molalidade), qual é independente da temperatura?", "Molalidade", ["Molaridade", "Ambas", "Nenhuma"], "Molalidade usa massa de solvente; a molaridade depende do volume, que se expande com a temperatura."],

  /* ---------------- f-diluicao ---------------- */
  ["f-diluicao", 1, "Diluir 10,0 mL de solução 0,500 M a 250,0 mL resulta em:", "0,0200 M", ["0,0500 M", "0,200 M", "12,5 M"], "c₂ = 0,500 × 10,0 / 250,0 = 0,0200 M."],
  ["f-diluicao", 1, "Ao preparar ácido sulfúrico diluído a partir do concentrado, deve-se:", "Adicionar o ácido lentamente à água, sob agitação", ["Adicionar a água ao ácido", "Misturar ambos de uma vez", "Aquecer o ácido antes"], "A dissolução é muito exotérmica; adicionar água ao ácido pode causar ebulição localizada e projeção."],
  ["f-diluicao", 2, "Qual vidraria é mais adequada para medir 25,00 mL de alíquota para uma titulação?", "Pipeta volumétrica", ["Proveta", "Béquer", "Pipeta graduada de 50 mL"], "A pipeta volumétrica (classe A) tem tolerância de ~±0,03 mL para 25 mL."],
  ["f-diluicao", 2, "Três diluições consecutivas 1:5 correspondem a um fator total de:", "125", ["15", "25", "3"], "Os fatores se multiplicam: 5 × 5 × 5 = 125."],

  /* ---------------- f-volumetria-calc ---------------- */
  ["f-volumetria-calc", 1, "Qual NÃO é característica desejável de um padrão primário?", "Ser higroscópico", ["Alta pureza", "Massa molar elevada", "Estabilidade ao ar"], "Padrões primários devem ser não higroscópicos para que a massa pesada corresponda ao soluto."],
  ["f-volumetria-calc", 2, "A diferença entre ponto de equivalência e ponto final é chamada de:", "Erro de titulação", ["Erro de paralaxe", "Fator de correção", "Branco"], "O ponto final é observado; o PE é teórico. A diferença é o erro de titulação, corrigível por titulação do branco."],
  ["f-volumetria-calc", 2, "Biftalato de potássio é usado para padronizar:", "Soluções de NaOH", ["Soluções de HCl", "Soluções de EDTA", "Soluções de AgNO₃"], "KHP é um ácido monoprótico fraco, padrão primário para bases."],
  ["f-volumetria-calc", 3, "A retrotitulação é especialmente indicada quando:", "A reação direta é lenta ou não há indicador adequado", ["O titulante é padrão primário", "A amostra é líquida", "O analito está em grande quantidade"], "Adiciona-se excesso conhecido para completar a reação e titula-se o excesso (ex.: CaCO₃ + HCl, Volhard)."],
  ["f-volumetria-calc", 3, "A solução de NaOH deve ser padronizada periodicamente porque:", "Absorve CO₂ do ar, formando carbonato", ["Evapora rapidamente", "Reage com o vidro da bureta instantaneamente", "Sofre fotólise"], "NaOH absorve CO₂ (formando Na₂CO₃) e é higroscópico; por isso não é padrão primário."],

  /* ---------------- e-erros ---------------- */
  ["e-erros", 1, "Uma balança descalibrada que sempre indica 0,5 mg a mais causa erro:", "Sistemático", ["Aleatório", "Grosseiro", "Estatístico"], "Erro de mesmo sinal e magnitude reprodutível: sistemático instrumental."],
  ["e-erros", 2, "Resultados muito próximos entre si, porém distantes do valor verdadeiro, indicam:", "Alta precisão e baixa exatidão", ["Alta exatidão e baixa precisão", "Alta precisão e alta exatidão", "Erro aleatório elevado"], "Concordância entre réplicas = precisão; afastamento do verdadeiro = erro sistemático."],
  ["e-erros", 2, "Um erro sistemático CONSTANTE afeta mais significativamente:", "Amostras de massa pequena", ["Amostras de massa grande", "Todas igualmente em termos relativos", "Apenas a precisão"], "Erro absoluto fixo representa fração maior de uma quantidade pequena."],
  ["e-erros", 2, "A análise de um material de referência certificado serve principalmente para avaliar:", "A exatidão do método", ["A precisão do método", "O limite de detecção", "A seletividade"], "Comparar o resultado com o valor certificado revela erros sistemáticos."],
  ["e-erros", 3, "A determinação do branco corrige erros:", "Sistemáticos provenientes de reagentes e do procedimento", ["Aleatórios de leitura", "Grosseiros", "De amostragem"], "O branco contém tudo exceto a amostra; seu sinal é subtraído dos resultados."],

  /* ---------------- e-descritiva ---------------- */
  ["e-descritiva", 1, "No cálculo do desvio padrão amostral, divide-se por n − 1 porque:", "Um grau de liberdade é usado para estimar a média", ["Facilita o cálculo", "Elimina outliers", "Corrige erros sistemáticos"], "A média é calculada dos próprios dados; restam n − 1 desvios independentes."],
  ["e-descritiva", 2, "Ao aumentar o número de réplicas, o intervalo de confiança da média:", "Estreita-se (diminui com √n e com t menor)", ["Alarga-se", "Não muda", "Depende apenas do erro sistemático"], "Semiamplitude = ts/√n; t diminui e √n aumenta com n."],
  ["e-descritiva", 2, "Numa distribuição normal, a fração de resultados entre μ − 2σ e μ + 2σ é aproximadamente:", "95 %", ["68 %", "99,7 %", "50 %"], "Regra 68–95–99,7."],
  ["e-descritiva", 3, "Qual afirmação sobre o IC de 95 % é correta?", "95 % dos intervalos construídos dessa forma conteriam a média verdadeira", ["Há 95 % de probabilidade de a próxima medida cair no intervalo", "95 % dos dados estão dentro do intervalo", "A média verdadeira é igual à média amostral com 95 % de certeza"], "O IC se refere à média populacional e ao procedimento de construção, não a medidas individuais."],
  ["e-descritiva", 2, "O coeficiente de variação (DPR) é útil porque:", "Permite comparar precisões de resultados com magnitudes diferentes", ["Mede exatidão", "Elimina a unidade de medida da média", "Substitui o teste t"], "Expressa s em relação à média (%), sendo adimensional."],

  /* ---------------- e-testes ---------------- */
  ["e-testes", 1, "O teste Q de Dixon é usado para:", "Decidir sobre a rejeição de um valor anômalo", ["Comparar duas médias", "Comparar duas variâncias", "Calcular o IC"], "Q = afastamento/amplitude, comparado ao Q crítico."],
  ["e-testes", 2, "Para comparar a PRECISÃO de dois métodos, usa-se o teste:", "F", ["t pareado", "Q", "Grubbs"], "F = s₁²/s₂²."],
  ["e-testes", 2, "Se t calculado > t crítico (95 %) ao comparar uma média com um valor certificado, conclui-se que:", "Há diferença significativa, indicando erro sistemático", ["O método é preciso", "A diferença é devida ao acaso", "Deve-se rejeitar o maior valor"], "A diferença é maior do que a esperada por erros aleatórios."],
  ["e-testes", 3, "Dois métodos foram aplicados às MESMAS 8 amostras de diferentes origens. O teste mais apropriado para compará-los é:", "Teste t pareado", ["Teste t com s agrupado", "Teste F", "Teste Q"], "Cada amostra é analisada pelos dois métodos; a variação entre amostras é eliminada analisando as diferenças."],
  ["e-testes", 3, "Antes de usar o teste t com desvio padrão agrupado para duas médias, deve-se verificar:", "Pelo teste F se as variâncias não diferem significativamente", ["Se as médias são iguais", "Se n₁ = n₂ obrigatoriamente", "Se não há outliers pelo teste t"], "O s agrupado pressupõe variâncias homogêneas; caso contrário, usa-se Welch."],

  /* ---------------- e-propagacao ---------------- */
  ["e-propagacao", 1, "Em y = a − b, a incerteza de y é obtida por:", "√(s_a² + s_b²)", ["s_a − s_b", "s_a + s_b", "√(s_a/a)² + (s_b/b)²"], "Somas e subtrações propagam incertezas absolutas em quadratura."],
  ["e-propagacao", 2, "Em c = m/(M·V), a incerteza relativa de c é:", "√((s_m/m)² + (s_V/V)² + (s_M/M)²)", ["s_m + s_V", "√(s_m² + s_V²)", "(s_m/m)·(s_V/V)"], "Produtos e quocientes propagam incertezas relativas em quadratura."],
  ["e-propagacao", 2, "Por que se recomenda gastar 20–40 mL numa bureta de 50 mL?", "Para que a incerteza relativa das leituras seja pequena", ["Para economizar titulante", "Porque o indicador só funciona nessa faixa", "Para evitar o erro de paralaxe"], "A incerteza absoluta (~±0,03 mL) é fixa; quanto maior o volume, menor o erro relativo."],
  ["e-propagacao", 3, "Se pH = 5,00 ± 0,02, a incerteza relativa de [H⁺] é aproximadamente:", "4,6 %", ["0,4 %", "2 %", "0,02 %"], "s_[H]/[H] = 2,303 × 0,02 = 0,046."],

  /* ---------------- e-calibracao ---------------- */
  ["e-calibracao", 1, "Na curva analítica y = mx + b, a inclinação m representa:", "A sensibilidade do método", ["O limite de detecção", "O sinal do branco", "A precisão"], "Sensibilidade de calibração = variação do sinal por unidade de concentração."],
  ["e-calibracao", 2, "Um R² = 0,999 garante que a resposta é linear?", "Não; é preciso avaliar o gráfico de resíduos", ["Sim, sempre", "Sim, se n > 5", "Não, pois R² deve ser exatamente 1"], "Curvaturas sistemáticas podem coexistir com R² alto; resíduos com tendência revelam não linearidade."],
  ["e-calibracao", 2, "O método da adição de padrão é preferido quando:", "Há efeito de matriz significativo", ["O analito é volátil", "Não há padrão disponível", "A amostra é muito concentrada"], "Os padrões são adicionados à própria amostra, que sofre os mesmos efeitos de matriz."],
  ["e-calibracao", 2, "O padrão interno corrige principalmente:", "Variações de volume injetado e de resposta instrumental", ["Efeitos de matriz espectrais", "Erros de pesagem da amostra", "Interferentes que coeluem"], "Usa-se a razão sinal analito/sinal padrão interno, que compensa flutuações."],
  ["e-calibracao", 3, "Segundo o ICH, o LOQ calculado como 10 s/m corresponde a:", "Menor concentração quantificável com precisão e exatidão aceitáveis", ["Menor concentração detectável", "Concentração em que o sinal é 3 vezes o ruído", "Limite superior da faixa linear"], "LOD detecta (3,3 s/m); LOQ quantifica (10 s/m)."],

  /* ---------------- q-equilibrio ---------------- */
  ["q-equilibrio", 1, "Na expressão da constante de equilíbrio, sólidos puros e o solvente:", "Não aparecem (atividade = 1)", ["Aparecem com sua concentração", "Aparecem no denominador", "Aparecem elevados a zero apenas em fase gasosa"], "Suas atividades são unitárias."],
  ["q-equilibrio", 2, "Aumentar a força iônica de uma solução saturada de BaSO₄ (adicionando KNO₃) faz a solubilidade:", "Aumentar (efeito salino)", ["Diminuir (íon comum)", "Não variar", "Zerar"], "Os coeficientes de atividade diminuem; para manter Kps, as concentrações aumentam."],
  ["q-equilibrio", 2, "A força iônica de MgSO₄ 0,010 M é:", "0,040 M", ["0,010 M", "0,020 M", "0,080 M"], "μ = ½(0,010·4 + 0,010·4) = 0,040 M."],
  ["q-equilibrio", 3, "Segundo Debye-Hückel, para mesma força iônica, o coeficiente de atividade é MENOR para:", "Íons de carga maior", ["Íons de raio hidratado maior", "Moléculas neutras", "Íons monovalentes"], "log γ ∝ −z²; carga maior → γ menor."],
  ["q-equilibrio", 2, "Se a reação A ⇌ B tem K₁ e B ⇌ C tem K₂, a reação A ⇌ C tem K =", "K₁·K₂", ["K₁ + K₂", "K₁/K₂", "√(K₁K₂)"], "Somar reações multiplica as constantes."],

  /* ---------------- q-acidobase ---------------- */
  ["q-acidobase", 1, "O pH de HCl 1,0 × 10⁻⁸ M é aproximadamente:", "6,98", ["8,00", "7,00", "6,00"], "A contribuição da água ([H⁺] ≈ 10⁻⁷) domina; resolve-se o balanço de carga."],
  ["q-acidobase", 2, "A aproximação [H⁺] ≈ √(Ka·c) é válida quando:", "A ionização é pequena (< 5 %), ou seja, c/Ka grande", ["O ácido é forte", "c < Ka", "pH > 7"], "Requer x ≪ c para desprezar x no denominador."],
  ["q-acidobase", 2, "Diluir 10 vezes um ácido fraco faz o pH:", "Aumentar cerca de 0,5 unidade", ["Aumentar 1 unidade", "Não variar", "Diminuir 0,5 unidade"], "[H⁺] ∝ √c; fator 10 em c → fator √10 em [H⁺] → ΔpH = 0,5."],
  ["q-acidobase", 2, "O grau de ionização de um ácido fraco ______ com a diluição.", "Aumenta", ["Diminui", "Permanece constante", "Torna-se zero"], "Lei da diluição de Ostwald: α ≈ √(Ka/c)."],
  ["q-acidobase", 3, "O balanço de carga para uma solução de NaOAc é:", "[Na⁺] + [H⁺] = [OAc⁻] + [OH⁻]", ["[Na⁺] = [OAc⁻] + [HOAc]", "[H⁺] = [OH⁻]", "[Na⁺] + [OAc⁻] = [H⁺] + [OH⁻]"], "Soma das cargas positivas = soma das negativas; [Na⁺] = [OAc⁻] + [HOAc] é o balanço de MASSA."],

  /* ---------------- q-tampao ---------------- */
  ["q-tampao", 1, "A capacidade tamponante é máxima quando:", "pH = pKa", ["pH = 7", "[ácido] ≫ [base]", "A solução está muito diluída"], "β é máxima em [HA] = [A⁻]."],
  ["q-tampao", 2, "Diluir um tampão acetato 10 vezes com água:", "Praticamente não altera o pH, mas reduz a capacidade tamponante", ["Aumenta o pH em 1 unidade", "Diminui o pH em 1 unidade", "Aumenta a capacidade tamponante"], "A razão [A⁻]/[HA] não muda; β é proporcional à concentração total."],
  ["q-tampao", 2, "Para preparar um tampão de pH 9,2, o par mais adequado é:", "NH₄⁺/NH₃ (pKa 9,24)", ["HOAc/OAc⁻ (pKa 4,76)", "H₂PO₄⁻/HPO₄²⁻ (pKa 7,20)", "HCOOH/HCOO⁻ (pKa 3,75)"], "Escolha um par com pKa dentro de ±1 do pH desejado."],
  ["q-tampao", 3, "Um tampão é formado por titulação parcial de ácido acético com NaOH. Em qual fração titulada o pH = pKa?", "50 %", ["25 %", "100 %", "0 %"], "Metade do HA convertida em A⁻: razão 1, log 1 = 0."],

  /* ---------------- q-poliprotico ---------------- */
  ["q-poliprotico", 1, "Em pH = pKa₂ de um ácido diprótico, as espécies em concentrações iguais são:", "HA⁻ e A²⁻", ["H₂A e HA⁻", "H₂A e A²⁻", "Todas as três"], "Em pH = pKₙ, a forma ácida e a base conjugada daquela etapa têm frações iguais."],
  ["q-poliprotico", 2, "O pH de uma solução de NaHCO₃ é aproximadamente:", "8,3", ["6,4", "10,3", "7,0"], "Espécie anfiprótica: pH ≈ (pKa₁ + pKa₂)/2 = (6,35 + 10,33)/2."],
  ["q-poliprotico", 2, "Em pH 7,2, as espécies predominantes do ácido fosfórico (pKa 2,15; 7,20; 12,35) são:", "H₂PO₄⁻ e HPO₄²⁻ em quantidades iguais", ["H₃PO₄ e H₂PO₄⁻", "HPO₄²⁻ e PO₄³⁻", "Apenas PO₄³⁻"], "pH = pKa₂."],
  ["q-poliprotico", 3, "Para que um ácido diprótico apresente dois saltos distintos na titulação, é necessário que:", "K₁/K₂ seja maior que cerca de 10⁴", ["K₁ = K₂", "O ácido seja forte", "pKa₂ < 7"], "Constantes muito próximas fazem os saltos se fundirem."],

  /* ---------------- q-solubilidade ---------------- */
  ["q-solubilidade", 1, "Para Ag₂CrO₄, a relação entre Kps e solubilidade s é:", "Kps = 4s³", ["Kps = s²", "Kps = 2s³", "Kps = 27s⁴"], "Ag₂CrO₄ → 2Ag⁺ + CrO₄²⁻: (2s)²·s = 4s³."],
  ["q-solubilidade", 2, "AgCl (Kps 1,8×10⁻¹⁰) e Ag₂CrO₄ (Kps 1,2×10⁻¹²): qual é mais solúvel em água pura?", "Ag₂CrO₄ (s ≈ 6,7×10⁻⁵ M)", ["AgCl (s ≈ 1,3×10⁻⁵ M)", "Ambos igualmente", "Não é possível comparar"], "Com estequiometrias diferentes, compare s, não Kps. É por isso que o cromato só precipita depois do AgCl no método de Mohr."],
  ["q-solubilidade", 2, "A solubilidade do CaF₂ em meio ácido é maior que em água porque:", "F⁻ é protonado a HF, deslocando o equilíbrio de dissolução", ["H⁺ forma complexo com Ca²⁺", "O efeito salino é nulo", "O ácido oxida o fluoreto"], "Ânions de ácidos fracos são removidos pelo H⁺ (Le Chatelier)."],
  ["q-solubilidade", 3, "Misturam-se volumes iguais de AgNO₃ 2×10⁻⁵ M e NaCl 2×10⁻⁵ M. Há precipitação de AgCl (Kps 1,8×10⁻¹⁰)?", "Não, pois Q = 1,0×10⁻¹⁰ < Kps", ["Sim, pois Q = 4×10⁻¹⁰ > Kps", "Sim, sempre que houver Ag⁺ e Cl⁻", "Não é possível prever"], "Após mistura cada íon fica 1×10⁻⁵ M: Q = 1,0×10⁻¹⁰."],

  /* ---------------- c-neutralizacao ---------------- */
  ["c-neutralizacao", 1, "Na titulação de ácido acético com NaOH, o pH no ponto de equivalência é:", "Maior que 7", ["Igual a 7", "Menor que 7", "Igual ao pKa"], "No PE há apenas acetato, base fraca."],
  ["c-neutralizacao", 2, "Por que a fenolftaleína NÃO é adequada para titular NH₃ com HCl?", "Vira em pH 8–10, antes do PE (pH ≈ 5,3)", ["Porque é tóxica", "Porque reage com NH₃", "Porque vira em pH ácido"], "O indicador deve virar dentro do salto, que ocorre em meio ácido."],
  ["c-neutralizacao", 2, "Qual fator AUMENTA o salto de pH no PE da titulação de um ácido fraco com base forte?", "Maior Ka e maior concentração", ["Menor Ka", "Menor concentração", "Usar indicador de faixa mais larga"], "Ácidos mais fortes e soluções mais concentradas dão saltos maiores."],
  ["c-neutralizacao", 3, "Numa amostra de carbonato + bicarbonato titulada com HCl, V₁ (fenolftaleína) = 10 mL e V₂ adicional (alaranjado de metila) = 25 mL. A amostra contém:", "CO₃²⁻ (V₁) e HCO₃⁻ original (V₂ − V₁ = 15 mL)", ["Apenas CO₃²⁻", "OH⁻ e CO₃²⁻", "Apenas HCO₃⁻"], "Método de Warder: V₁ converte CO₃²⁻ → HCO₃⁻; V₂ titula todo HCO₃⁻ (formado + original). V₂ > V₁ indica bicarbonato original."],
  ["c-neutralizacao", 3, "Na titulação de H₃PO₄ com NaOH, quantos saltos bem definidos são observados?", "Dois", ["Um", "Três", "Nenhum"], "O 3º próton (pKa 12,35) é fraco demais para gerar salto visível em água."],

  /* ---------------- c-precipitacao ---------------- */
  ["c-precipitacao", 1, "No método de Mohr, o indicador é:", "Cromato de potássio", ["Ferro(III)", "Fluoresceína", "Negro de eriocromo T"], "Após o PE, forma-se Ag₂CrO₄ vermelho-tijolo."],
  ["c-precipitacao", 2, "O método de Mohr deve ser realizado em pH entre 7 e 10 porque:", "Em meio ácido, CrO₄²⁻ converte-se em Cr₂O₇²⁻; em meio muito básico precipita AgOH/Ag₂O", ["O AgCl se dissolve em pH < 7", "O indicador é instável na luz", "O titulante decompõe em pH neutro"], "O equilíbrio cromato/dicromato e a precipitação de óxido de prata limitam a faixa."],
  ["c-precipitacao", 2, "O método de Volhard é uma:", "Retrotitulação do excesso de Ag⁺ com SCN⁻ usando Fe³⁺", ["Titulação direta com cromato", "Titulação com indicador de adsorção", "Titulação complexométrica"], "Forma FeSCN²⁺ vermelho após consumir o excesso de prata; feita em meio ácido."],
  ["c-precipitacao", 3, "No Volhard para cloreto, filtra-se o AgCl (ou adiciona-se nitrobenzeno) porque:", "AgCl é mais solúvel que AgSCN e reagiria com o tiocianato", ["AgCl absorve o indicador", "AgCl é colorido", "AgCl catalisa a oxidação do SCN⁻"], "Sem isso, AgCl + SCN⁻ → AgSCN + Cl⁻, gerando erro negativo."],
  ["c-precipitacao", 2, "Na titulação de Cl⁻, Br⁻ e I⁻ com Ag⁺ (mesmas concentrações), o maior salto ocorre para:", "I⁻", ["Cl⁻", "Br⁻", "Todos iguais"], "Menor Kps (AgI 8,3 × 10⁻¹⁷) → maior salto de pAg."],

  /* ---------------- c-complexometria ---------------- */
  ["c-complexometria", 1, "O EDTA forma com a maioria dos íons metálicos complexos na proporção:", "1:1", ["1:2", "2:1", "1:6"], "Independe da carga do metal: um EDTA hexadentado por metal."],
  ["c-complexometria", 2, "A titulação de Ca²⁺ com EDTA é feita em pH 10 porque:", "α(Y⁴⁻) é alto o suficiente para K'f grande", ["O Ca²⁺ precipita em pH menor", "O EDTA é insolúvel em pH ácido", "O indicador é incolor em pH 7"], "K'f = α(Y⁴⁻)·Kf; em pH baixo α é muito pequeno e K'f insuficiente."],
  ["c-complexometria", 2, "Com Erio T em pH 10, o ponto final é observado pela mudança de:", "Vinho/vermelho para azul", ["Azul para vinho", "Incolor para rosa", "Amarelo para laranja"], "Antes do PE o indicador está ligado ao metal (vinho); no PE é deslocado e fica livre (azul)."],
  ["c-complexometria", 3, "Para determinar SÓ Ca²⁺ numa água que contém Mg²⁺, usa-se:", "pH 12–13 (Mg(OH)₂ precipita) e murexida/calcon", ["pH 10 com Erio T", "pH 4 com xilenol laranja", "Mascaramento do Ca com CN⁻"], "Em pH alto o Mg sai como hidróxido; o Ca é titulado sozinho."],
  ["c-complexometria", 3, "Agentes de complexação auxiliares (ex.: NH₃ na titulação de Zn²⁺) são usados para:", "Manter o metal em solução sem impedir a reação com EDTA", ["Aumentar o Kf do EDTA", "Servir como indicador", "Precipitar interferentes"], "Evitam a precipitação do hidróxido; reduzem um pouco o K'f (fator αM)."],

  /* ---------------- c-redox ---------------- */
  ["c-redox", 1, "No permanganato em meio ácido, o manganês passa de +7 para:", "+2 (5 elétrons)", ["+4 (3 elétrons)", "+6 (1 elétron)", "0 (7 elétrons)"], "MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O."],
  ["c-redox", 2, "Na titulação de Fe²⁺ com Ce⁴⁺, o potencial no ponto em que metade do Fe²⁺ foi titulado é igual a:", "E°' do par Fe³⁺/Fe²⁺", ["E°' do par Ce⁴⁺/Ce³⁺", "Média dos dois E°", "Zero"], "[Fe²⁺] = [Fe³⁺] → log 1 = 0."],
  ["c-redox", 2, "Por que KMnO₄ dispensa indicador?", "A própria cor púrpura do excesso sinaliza o ponto final", ["Porque forma precipitado", "Porque a reação é instantânea", "Porque Mn²⁺ é colorido"], "Mn²⁺ é praticamente incolor; uma gota em excesso deixa rosa persistente."],
  ["c-redox", 3, "Na iodometria, o amido é adicionado próximo ao ponto final porque:", "Concentrações altas de I₂ formam complexo com amido que se desfaz lentamente", ["O amido oxida o tiossulfato", "O amido decompõe o I₂", "O amido só é estável em meio básico"], "Adicionar cedo prende I₂ e causa ponto final tardio e impreciso."],
  ["c-redox", 3, "O dicromato de potássio tem vantagem sobre o permanganato por:", "Ser padrão primário e estável em solução, podendo ser usado em HCl", ["Ser autoindicador", "Ter maior E°", "Reagir com 5 elétrons"], "K₂Cr₂O₇ é obtido muito puro; o MnO₄⁻ oxida Cl⁻ e se decompõe."],

  /* ---------------- c-gravimetria ---------------- */
  ["c-gravimetria", 1, "Para obter precipitados com partículas maiores, a supersaturação relativa deve ser:", "Baixa", ["Alta", "Nula", "Irrelevante"], "Baixa SR favorece crescimento sobre nucleação (Von Weimarn)."],
  ["c-gravimetria", 2, "A digestão do precipitado (aquecimento em contato com a água-mãe) tem como finalidade:", "Aumentar o tamanho das partículas e reduzir impurezas adsorvidas", ["Dissolver o precipitado", "Oxidar o analito", "Secar o precipitado"], "Ocorre recristalização (amadurecimento de Ostwald)."],
  ["c-gravimetria", 2, "Lava-se AgCl com HNO₃ diluído, e não com água pura, para evitar:", "Peptização (redispersão coloidal)", ["Oxidação do Ag", "Formação de AgNO₃", "Fotodecomposição"], "O eletrólito mantém o coloide coagulado."],
  ["c-gravimetria", 3, "A precipitação homogênea (ex.: hidrólise da ureia) é vantajosa porque:", "Gera o reagente precipitante lentamente em toda a solução, mantendo SR baixa", ["Usa menos reagente", "Dispensa a filtração", "Elimina a calcinação"], "Produz precipitados densos, puros e facilmente filtráveis."],
  ["c-gravimetria", 3, "Contaminação em que o íon interferente substitui o analito na rede cristalina chama-se:", "Formação de cristal misto (inclusão)", ["Adsorção superficial", "Oclusão mecânica", "Pós-precipitação"], "Difícil de remover por lavagem; exige separação prévia ou outro precipitante."],

  /* ---------------- i-espectro ---------------- */
  ["i-espectro", 1, "Uma solução de KMnO₄ é púrpura porque absorve principalmente:", "Verde (~525 nm)", ["Púrpura", "Vermelho", "Azul"], "A cor observada é a complementar da absorvida."],
  ["i-espectro", 2, "Medir no comprimento de onda de absorção máxima (λmáx) é recomendado porque:", "Maximiza a sensibilidade e minimiza desvios por radiação policromática", ["Aumenta o caminho óptico", "Elimina efeitos de matriz", "Torna a absorbância independente da concentração"], "No máximo, ε varia pouco com λ."],
  ["i-espectro", 2, "Para medidas no UV (abaixo de ~320 nm), a cubeta deve ser de:", "Quartzo", ["Vidro comum", "Poliestireno", "Qualquer material transparente"], "Vidro e plásticos absorvem no UV."],
  ["i-espectro", 3, "Desvios NEGATIVOS da lei de Beer em altas absorbâncias são frequentemente causados por:", "Radiação espúria (luz parasita) atingindo o detector", ["Uso de radiação monocromática", "Baixa concentração do analito", "Aumento do caminho óptico"], "A luz espúria não é absorvida, fazendo T aparente maior que a real."],
  ["i-espectro", 3, "O ponto isosbéstico num conjunto de espectros indica:", "Comprimento de onda em que duas espécies em equilíbrio têm o mesmo ε", ["λmáx do analito", "Região de absorbância nula", "Erro instrumental"], "A absorbância não muda com a proporção entre as espécies."],

  /* ---------------- i-potenciometria ---------------- */
  ["i-potenciometria", 1, "Uma célula galvânica com E > 0 indica reação:", "Espontânea (ΔG < 0)", ["Não espontânea", "Em equilíbrio", "Que requer corrente externa"], "ΔG = −nFE."],
  ["i-potenciometria", 2, "A 25 °C, um eletrodo de vidro ideal varia quanto por unidade de pH?", "59,16 mV", ["29,58 mV", "100 mV", "0,0592 mV"], "Inclinação de Nernst para íon monovalente."],
  ["i-potenciometria", 2, "O erro alcalino do eletrodo de vidro faz o pH lido ser:", "Menor que o real, por resposta a Na⁺", ["Maior que o real", "Igual ao real", "Instável sem tendência"], "Em pH > 11 o eletrodo responde também a Na⁺."],
  ["i-potenciometria", 3, "Na equação de Nikolsky-Eisenman, um coeficiente de seletividade kᵢⱼ muito pequeno indica:", "Alta seletividade ao íon primário i", ["Alta interferência de j", "Inclinação sub-nernstiana", "Eletrodo de referência instável"], "kᵢⱼ mede quanto o íon j contribui para o potencial."],
  ["i-potenciometria", 3, "Numa titulação potenciométrica, o ponto final corresponde a:", "Máximo da 1ª derivada (ΔE/ΔV) ou zero da 2ª derivada", ["E = 0", "Mínimo da curva E × V", "Primeiro ponto estável"], "O ponto de inflexão da curva sigmoide."],

  /* ---------------- i-cromatografia ---------------- */
  ["i-cromatografia", 1, "Uma resolução Rs = 1,5 corresponde a:", "Separação praticamente completa (linha de base)", ["Picos sobrepostos", "Separação de 50 %", "Coluna sobrecarregada"], "Rs 1,5 → sobreposição ~0,3 %."],
  ["i-cromatografia", 2, "Dobrar o comprimento da coluna (mantendo k e α) multiplica a resolução por:", "√2 ≈ 1,41", ["2", "4", "Não altera"], "Rs ∝ √N e N ∝ L."],
  ["i-cromatografia", 2, "Na equação de van Deemter, o termo B/u está associado a:", "Difusão longitudinal", ["Caminhos múltiplos", "Transferência de massa", "Volume morto"], "Domina em vazões baixas."],
  ["i-cromatografia", 3, "Qual mudança costuma ser MAIS eficaz para melhorar a resolução de dois picos muito próximos?", "Alterar a seletividade α (fase móvel/estacionária ou temperatura)", ["Aumentar N dobrando a coluna", "Aumentar a vazão", "Injetar mais amostra"], "Pela equação de Purnell, pequenas mudanças em α têm grande efeito."],
  ["i-cromatografia", 3, "Em HPLC de fase reversa, aumentar a proporção de solvente orgânico na fase móvel:", "Diminui os tempos de retenção", ["Aumenta os tempos de retenção", "Não altera a retenção", "Inverte a ordem de eluição sempre"], "A fase móvel fica mais apolar e com maior força eluente."],
];
