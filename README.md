# Stelus Bordados — Site estático

O site em `site/` não usa Node.js, banco de dados, API ou etapa de compilação.

## Estrutura

```text
site/
├── index.html
├── servicos.html
├── contato.html
└── assets/
    ├── css/
    │   ├── variables.css
    │   ├── base.css
    │   ├── layout.css
    │   ├── components.css
    │   ├── accessibility.css
    │   └── main.css
    ├── js/
    │   ├── app.js
    │   ├── config/site.js
    │   ├── components/
    │   │   ├── navigation.js
    │   │   ├── gallery-modal.js
    │   │   └── contact-form.js
    │   └── utils/dom.js
    ├── images/
    ├── icons/
    └── logos/
```

O JavaScript usa módulos ES6, sem dependências globais. O formulário valida os campos no navegador e abre uma conversa no WhatsApp com os dados preenchidos pelo visitante; não há backend para configurar.

O CSS é organizado por responsabilidade: tokens em `variables.css`, regras globais em `base.css`, grade e seções em `layout.css`, componentes em `components.css` e preferências de acessibilidade em `accessibility.css`.

## Publicação

Envie todo o conteúdo da pasta `site/` para a hospedagem estática. Não é necessário Docker, Node.js, banco de dados ou etapa de compilação.
