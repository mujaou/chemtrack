# ⬡ CHEMTRACK – Gestão de Produtos Químicos Industriais

Sistema web para controle de estoque, consumo e previsão de compra de produtos químicos com integração manual SAP.

## 🚀 Como rodar localmente

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## 📦 Como fazer o build para publicar

```bash
npm run build
```

Os arquivos de produção ficam na pasta `dist/`.

## ☁️ Deploy no Vercel (recomendado)

1. Faça login em [vercel.com](https://vercel.com) com sua conta GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório **chemtrack**
4. Clique em **Deploy** (as configurações são detectadas automaticamente)
5. Pronto! Você receberá uma URL pública como `chemtrack.vercel.app`

## 📱 Instalar como app no celular

Após publicar no Vercel:
- **Android**: abra a URL no Chrome → menu ⋮ → "Adicionar à tela inicial"
- **iPhone**: abra a URL no Safari → compartilhar → "Adicionar à Tela de Início"

## 🧩 Funcionalidades

- Dashboard gerencial com KPIs e status de estoque
- Cadastro de produtos com código SAP
- Lançamento semanal SAP + Inventário Físico
- Cálculo automático de consumo, cobertura e compras sugeridas
- Curva ABC automática
- Central de alertas (estoque crítico, divergência SAP x Físico)
- Log de auditoria
- Relatórios de consumo e acuracidade

## 🔧 Tecnologias

- React 18
- Vite 5
- PWA (instalável no celular e desktop)
