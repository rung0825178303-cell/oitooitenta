# Deploy na Railway

Este projeto está pronto para ser deployado na Railway. Siga os passos abaixo:

## Pré-requisitos

1. Conta na Railway (https://railway.app)
2. Git instalado localmente
3. Node.js 18+ instalado

## Passo 1: Clonar o repositório

```bash
git clone <seu-repositorio-url>
cd ms-login-page
```

## Passo 2: Conectar à Railway

```bash
npm install -g @railway/cli
railway login
```

## Passo 3: Criar um novo projeto na Railway

```bash
railway init
```

Escolha um nome para o projeto (ex: "ms-login-page")

## Passo 4: Adicionar banco de dados MySQL

Na dashboard da Railway, clique em "+ New" e selecione "MySQL". Isso criará automaticamente a variável de ambiente `DATABASE_URL`.

## Passo 5: Configurar variáveis de ambiente

Na dashboard da Railway, vá para "Variables" e adicione:

```
ADMIN_PASSWORD=sua_senha_admin_aqui
JWT_SECRET=sua_chave_jwt_aqui
```

As demais variáveis (OAuth, Analytics, etc.) já estão configuradas no template.

## Passo 6: Deploy

```bash
railway up
```

Ou use a dashboard da Railway para fazer deploy automático via Git.

## Passo 7: Acessar a aplicação

Após o deploy, a Railway fornecerá uma URL pública. Acesse:

- **Página de login:** `https://seu-dominio.railway.app/`
- **Painel admin:** `https://seu-dominio.railway.app/admin`

## Verificar logs

```bash
railway logs
```

## Banco de dados

As tabelas serão criadas automaticamente na primeira execução. Se precisar resetar:

1. Acesse o MySQL na dashboard da Railway
2. Execute os comandos SQL em `drizzle/0001_fixed_rockslide.sql`

## Segurança

- Sempre use uma senha forte em `ADMIN_PASSWORD`
- Nunca comita `.env` no repositório
- As credenciais capturadas são salvas no banco de dados MySQL da Railway
- Os PDFs são armazenados em S3 (configurado automaticamente)

## Troubleshooting

**Erro de conexão ao banco de dados:**
- Verifique se a variável `DATABASE_URL` está configurada
- Reinicie o serviço na Railway

**Credenciais não estão sendo salvas:**
- Verifique os logs: `railway logs`
- Certifique-se de que o MySQL está rodando

**Painel admin não carrega:**
- Verifique se você está usando a senha correta em `ADMIN_PASSWORD`
- Limpe o cache do navegador

## Suporte

Para mais informações sobre Railway, visite: https://docs.railway.app
