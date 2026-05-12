# ByteDonto 🦷

Bem-vindo ao repositório do **ByteDonto**! Este repositório é composto por um Front-end (React) e um Back-end (Python/Flask). Este guia ajudará qualquer pessoa da equipe a configurar o ambiente e rodar o projeto localmente de forma simples.

---

## 🛠 1. Pré-requisitos

Para rodar o projeto de ponta a ponta, você vai precisar do **Node.js** (para o front-end) e do **Python** (para o back-end).

### Instalando NVM (Node Version Manager) no Linux / Mac
Para garantir que a equipe toda use a mesma versão do Node, recomendamos instalar através do NVM:

```bash
# 1. Instalar o NVM usando o link oficial do GitHub
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 2. Carregar o NVM no seu terminal (reinicie o terminal ou rode as linhas que o instalador pedir no final)

# 3. Instalar o Node.js na versão recomendada (20)
nvm install 20

# 4. Selecionar a versão instalada para uso
nvm use 20
```

---

## 🚀 2. Como rodar o projeto

O projeto está dividido em duas pastas: `frontend` e `backend`. É recomendável abrir duas abas no seu terminal para rodar ambos simultaneamente.

### 🖥 Passo 2.1: Rodando o Frontend (React)

Abra a primeira aba no terminal e siga estes passos:

<<<<<<< HEAD
Entra dentro do back:
```bash
cd backend/
```

Criar um ambiente virtual:
```bash
python3 -m venv venv
```

Ativar o ambiente virtual:
```bash
source venv/bin/activate
```

Instalar as dependências:
```bash
pip install -r requirements.txt
```

Rodar o servidor:
```bash
python3 run.py
```

Em outro bash, entrar dentro do front:
=======
>>>>>>> 1b2aa94 (redme atualizado)
```bash
# Entre na pasta do frontend
cd frontend/

<<<<<<< HEAD
Instalar as independencias:
```bash
npm install react-router-dom @supabase/supabase-js vite-plugin-svgr
```
=======
# Instale todas as dependências do projeto
npm install
>>>>>>> 1b2aa94 (redme atualizado)

# Inicie o servidor de desenvolvimento
npm run dev
```

*(O frontend normalmente será executado em `http://localhost:5173` ou na porta que o Vite indicar no terminal)*

### ⚙️ Passo 2.2: Rodando o Backend (Python/Flask)

Abra uma segunda aba no terminal e siga estes passos:

```bash
# Entre na pasta do backend
cd backend/

# Crie um ambiente virtual para isolar as dependências do Python
python3 -m venv venv

# Ative o ambiente virtual:
# - No Mac/Linux:
source venv/bin/activate
# - No Windows:
# .\venv\Scripts\Activate.ps1

# Instale as bibliotecas necessárias para a API (Flask, Supabase, etc.)
pip install -r requirements.txt

# Inicie o servidor do backend
python run.py
```

*(A API do backend será executada em `http://127.0.0.1:5000`)*

---

## 🤝 Repositório e Contribuição
🔗 **Link do GitHub:** [LucasfcBastos/ByteDonto](https://github.com/LucasfcBastos/ByteDonto)

**Atenção para as Variáveis de Ambiente:**  
Tanto o frontend quanto o backend dependem de variáveis sensíveis (`.env` com chaves de API, URLs de banco de dados, etc.). Essas chaves não sobem para o GitHub por questões de segurança. Para o sistema funcionar 100%, peça para alguém do grupo compartilhar com você como preencher o seu arquivo `.env` localmente.