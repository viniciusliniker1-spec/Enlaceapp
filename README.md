# Enlace

Organizador de casamento para casais e assessores. Next.js 16, React 19, Tailwind 4, Framer Motion, SQLite (`node:sqlite`, Node 22+).

## Rodar

```
npm install
npm run dev
```

## O que é real (backend)

- Contas (e-mail e senha com scrypt, sessão em cookie httpOnly), casais e assessores.
- Dados de cada casamento no banco, sincronizados entre os membros (polling de 5 s) e com operações por registro,
  então duas pessoas editando itens diferentes não se sobrescrevem.
- Equipe: o criador convida por e-mail com permissão de editar ou só ver (o servidor recusa escrita de quem só vê).
- Convite digital com link por família: o convidado confirma presença e deixa recado sem conta; o casal vê na hora.
- Lista de presentes pública com reserva atômica (nunca dois convidados no mesmo item).
- Cronograma público para fornecedores.
- Produtos: leitura de qualquer link de loja (JSON-LD, Open Graph) com proteção contra SSRF; busca integrada no
  Mercado Livre (`ML_CLIENT_ID` e `ML_CLIENT_SECRET`); fornecedores reais pelo Google Places (`GOOGLE_PLACES_KEY`).

Lojas como Mercado Livre, Amazon e Magalu bloqueiam leitura automática de páginas. Nesses casos o app preenche
o nome pelo endereço e deixa o casal conferir preço e foto. A busca do Mercado Livre só funciona com as chaves oficiais.

## Publicar

Precisa de um servidor Node com disco persistente (Railway, Fly.io, Render ou VPS): `docker build` e monte um volume em `/data`.
O SQLite não funciona em hospedagem sem disco (como funções serverless). Para isso, troque `lib/server/db.ts` por Postgres.

## Ainda não existe

Recuperação de senha e e-mails (precisam de um provedor de e-mail), cobrança da assinatura (Pix e cartão), e tempo real por WebSocket.
