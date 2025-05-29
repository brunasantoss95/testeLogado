# 🧪 Automação de Testes Web - Compra de Passagens

Projeto de automação de testes para compra de passagens intermunicipais, garantindo que usuários logados consigam efetuar a compra com sucesso no sistema Viop/Veppo.

## 🚀 Tecnologias Utilizadas

- **JavaScript**
- **Node.js**
- **Selenium**
- **WebDriverIO**
- **Mocha (Framework de Teste)**

## 📁 Estrutura do Projeto

/testeLogado
├── /helpers
│ └── helper.js # Funções de login e manipulação de sessão
│
├── /teste
│ ├── login.js # Realiza o login e salva sessão (cookies)
│ ├── compraPassagem.js # Fluxo completo de compra
│ └── principal.js # Tela de filtro após login
│
├── cookies.json # Armazena cookies para manter o usuário logado
└── wdio.conf.js # Configuração do WebDriverIO


## 🎯 Objetivo

Automatizar o fluxo completo de compra de passagens com um usuário logado, garantindo que:

- O login funcione corretamente;
- A sessão seja mantida entre testes via cookies;
- A compra seja realizada até a geração do Bilhete Eletrônico (BPe).

## 🛠️ Instalação

1. Instale o Node.js:
   ```bash
   node -v
   npm -v

2. Inicie a configuração do WebDriverIO:
   ```bash
   npm init wdio@latest .

3. Execute os testes:
- Login:
    ```bash
    npx wdio run ./wdio.conf.js --spec login.js
- Compra de Passagem:
    ```bash
    npx wdio run ./wdio.conf.js --spec compraPassagem.js

## 🔁 Fluxo Automatizado
Origem: Porto Alegre

Destino: Aleatório entre Santa Rosa, Santo Ângelo, Soledade e Santana do Livramento

Data: Mês atual + 5 dias

Poltrona: Aleatória e disponível

Pagamento: Cartão de crédito padrão

## ⚠️ Observação: 
-> Os dados do passageiro devem ser definidos manualmente no script.

## 👤 Responsável
  Bruna Santos

