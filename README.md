# QuimiAnalítica 2.0

Química Analítica **do elementar ao avançado**, num app web que funciona offline: trilha de estudo, simuladores animados, calculadoras com passo a passo, laboratório de dados, banco de questões com provas cronometradas e um painel de desempenho exportável.

## Rodar

```bash
bun install        # ou npm install
bun run dev        # http://localhost:5173
bun run test       # 102 testes: motor químico + fuzz de todos os geradores de questões
bun run build      # gera dist/ (site estático, ~1 MB gzip)
```

O `dist/` abre em qualquer servidor estático (GitHub Pages já configurado em `.github/workflows/deploy.yml`). Após a 1ª visita funciona **offline** e pode ser **instalado** como app (PWA) pelo Chrome/Edge — substitui o pacote Electron de 1,2 GB da v1.

## O que tem

| Área | Conteúdo |
|---|---|
| **Trilha** | 6 níveis, 27 tópicos — de notação científica e logaritmos até cromatografia — com teoria, fórmulas (KaTeX), objetivos, referências e treino embutido |
| **Simuladores** | Titulação animada (bureta, gotas, indicador, pHmetro, modo desafio) · Curvas ácido-base/EDTA/precipitação/redox · Espécies α × pH · Espectrofotômetro (curva analítica com ruído) · Cromatógrafo (bandas migrando, van Deemter) · Estatística visual (alvo, normal × t, cobertura de IC) |
| **Calculadoras (14)** | Matemática, massa molar, soluções, teor por titulação, estatística, testes Q/Grubbs/t/F, propagação de incertezas, atividade, pH exato, Kps, gravimetria, Nernst, Beer, cromatografia — todas com passo a passo |
| **Laboratório de dados** | Cole/importe CSV: calibração (LOD/LOQ, IC da amostra, resíduos, adição de padrão), comparação de grupos (F + t), titulação potenciométrica (1ª/2ª derivadas) |
| **Questões** | 73 geradores paramétricos (valores novos a cada vez, resposta e resolução calculadas pelo motor) + 123 questões conceituais originais no estilo de provas de graduação + importação das suas próprias questões (CSV/JSON) |
| **Provas** | 9 provas pré-montadas (P0–P5, finais de QA I e II, simulado geral) + prova personalizada; cronômetro, navegação, marcação para revisão, nota 0–10, revisão com resolução |
| **Painel** | Domínio por tópico, perfil por nível (radar), evolução diária, notas, dificuldade × tempo, mapa de atividade; filtros por período/modo/nível |
| **Exportação** | Todo gráfico → PNG/SVG/CSV; tabelas → CSV (Excel pt-BR); painel/prova/laboratório → PDF (imprimir); backup/restauração JSON do progresso |

## Arquitetura

```
src/engine/      motor químico puro (testado): ácido-base exato por balanço de carga,
                 EDTA/Kps/redox exatos, estatística (t, F, Grubbs por função beta), regressão
src/data/        trilha (curriculum.ts), elementos, banco de questões (geradores + conceituais)
src/components/  UI, gráficos com exportação, cartão de questão
src/pages/       telas (carregadas sob demanda)
src/store/       progresso persistido em localStorage (zustand)
```

Stack: Vite + React 19 + TypeScript + Tailwind 4 + Recharts + Framer Motion + KaTeX. Sem backend.

As questões conceituais são originais, elaboradas a partir dos tópicos clássicos de Skoog, Harris, Baccan e Vogel — não reproduzem provas reais. Para treinar com as provas do seu professor, use **Meus dados → Importar questões**.
