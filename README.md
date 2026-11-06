# Tasty-Flavors
Repositório de desenvolvimento do E-commerce Tasty Flavors.

## Ambientes do frontend

Cada ambiente tem as URLs do BFF e de autenticação, o token fixo e a chave de mocks em `frontend/ambientes/<ambiente>.env`.

| Ambiente | Rodar localmente | Gerar build |
| --- | --- | --- |
| dev | `npm run dev` | `npm run build:dev` |
| hml | `npm run dev:hml` | `npm run build:hml` |
| prod | `npm run dev:prod` | `npm run build:prod` (ou `npm run build`) |

Para valores só seus, como o token, crie `frontend/ambientes/<ambiente>.local.env`, que não vai para o git. Variáveis definidas no shell ou no CI têm prioridade sobre os arquivos. Depois de alterar um valor, reinicie o servidor ou refaça o build.

O token é embutido no JavaScript enviado ao navegador: mantenha-o vazio em produção.
