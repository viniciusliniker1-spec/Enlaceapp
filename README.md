# Enlace

Organizador de casamento para casais e assessores (Next.js 16, React 19, Tailwind 4, Framer Motion).

- `/` landing page
- `/app` aplicativo (dados salvos no navegador, em localStorage): visão geral, tarefas, fornecedores,
  orçamento e pagamentos, convidados (listas A e B), mesas, convite digital, presentes e enxoval,
  cronograma do dia, equipe e carteira de assessor
- `/convite`, `/lista`, `/cronograma` páginas públicas: os dados vão codificados no link (sem backend)

```
npm install
npm run dev
```

Próximo passo natural: conta e banco online (por exemplo Supabase) para respostas de convite,
reservas de presentes e permissões em tempo real.
