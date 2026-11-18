# Enlace

Organizador de casamento para casais e assessores. Next.js 16, React 19, Tailwind 4, Framer Motion, Postgres.

## Rodar local

```
npm install
npm run dev        # sem DATABASE_URL usa PGlite (Postgres em WASM) na pasta .data
```

## Publicar na Vercel

1. **Banco:** crie um Postgres gratuito no Neon (ou Supabase) e copie a URL de conexão (com pooler) para `DATABASE_URL`.
   As tabelas são criadas sozinhas no primeiro acesso.
2. **Vercel:** importe o repositório, em *Settings > Environment Variables* copie as variáveis de `.env.example`
   (no mínimo `DATABASE_URL` e `APP_URL`) e faça o deploy.
3. **E-mail (Resend):** crie a conta, verifique seu domínio e preencha `RESEND_API_KEY` e `EMAIL_FROM`.
   Sem isso, recuperar senha e convites por e-mail não são enviados (o link de convite continua aparecendo no app).
4. **Cobrança (Asaas):** crie a conta, gere a chave de API (`ASAAS_API_KEY`; deixe `ASAAS_SANDBOX=1` até validar),
   e cadastre o webhook `https://SEU_DOMINIO/api/webhooks/asaas` com um token secreto igual a `ASAAS_WEBHOOK_TOKEN`
   e os eventos de cobrança (confirmada, recebida, vencida) e de assinatura (removida, inativada).
5. **Mercado Livre:** crie um app em developers.mercadolivre.com.br e preencha `ML_CLIENT_ID` e `ML_CLIENT_SECRET`.
6. **Fornecedores reais:** no Google Cloud ative a *Places API (New)* e preencha `GOOGLE_PLACES_KEY`.

## Como funciona

- Contas com senha (scrypt) e sessão em cookie httpOnly. Casais e assessores.
- Dados de cada casamento em registros sincronizados entre os membros (polling de 5 s), com edição por registro.
- Equipe com permissão de editar ou só ver, aplicada no servidor.
- Convite digital por família, presença e recados sem conta do convidado. Lista de presentes com reserva atômica
  (linha travada no banco). Cronograma público para fornecedores.
- Produtos: leitura de links de lojas (JSON-LD e Open Graph, com proteção contra SSRF), busca no Mercado Livre
  e fornecedores pelo Google Places.
- Teste grátis de 7 dias por casamento (assessor: por conta). Depois, só leitura e links públicos pausados até assinar
  (R$ 34,90 por casamento ou R$ 129 por assessor, valores em `lib/server/billing.ts`).

## Limites conhecidos

- Lojas como Mercado Livre, Amazon e Magalu bloqueiam leitura automática de páginas; nesse caso o app preenche o
  nome pelo endereço e o casal confere preço e foto. Busca confiável só com API oficial.
- A cobrança foi escrita contra a documentação do Asaas e testada só no lado do servidor (webhook, bloqueio e
  liberação). Valide o fluxo completo no ambiente sandbox da Asaas antes de abrir ao público.
- Atualização por polling, não WebSocket.
