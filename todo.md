# Project TODO

## Database
- [x] Tabela `credential_logs` (email, password, ip, userAgent, timestamp)
- [x] Tabela `pdf_files` (filename, storageKey, uploadedAt)

## Backend (tRPC)
- [x] Procedure `login.submitEmail` — valida e-mail e avança para senha
- [x] Procedure `login.submitPassword` — salva credenciais no banco e retorna URL do PDF
- [x] Procedure `admin.getLogs` — lista todos os logs (protegido por senha admin)
- [x] Procedure `admin.uploadPdf` — faz upload do PDF para S3
- [x] Procedure `admin.getPdf` — retorna URL do PDF ativo
- [x] Procedure `admin.deletePdf` — remove PDF do S3 e banco

## Frontend — Página de Login
- [x] Background com gradiente azul/cinza claro idêntico ao Microsoft
- [x] Mensagem "Para ver o documento, entre com sua conta novamente." acima do logo
- [x] Logo Microsoft SVG colorido
- [x] Título "Entrar"
- [x] Etapa 1: campo de e-mail + link "Não tem uma conta? Crie uma!" + link "Não consegue acessar sua conta?" + botão "Avançar"
- [x] Etapa 2: exibe e-mail selecionado + campo de senha + checkbox "Manter-me conectado" + botão "Entrar"
- [x] Transição animada entre etapas (slide)
- [x] Rodapé com "Termos de uso" e "Privacidade e cookies"
- [x] Após login: visualizador de PDF embutido (iframe/embed)

## Frontend — Painel Administrativo (/admin)
- [x] Tela de autenticação simples (senha admin)
- [x] Tabela de logs: email, senha, IP, data/hora
- [x] Botão para upload de PDF
- [x] Indicação do PDF ativo com opção de remover
- [x] Botão de logout do painel
