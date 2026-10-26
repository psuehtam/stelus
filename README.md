# Stelus Bordados

Site estático pronto para publicação em hospedagem Apache.

## Publicação

Envie **o conteúdo da pasta `site/`** para a raiz pública da hospedagem (por exemplo, `public_html/`). A pasta `site/` não deve aparecer na URL. Não há etapa de build nem dependência de Node.js.

Páginas públicas: `index.html` e `servicos.html`. O contato fica na seção `index.html#contato`. `404.html` é usada pelo servidor e não entra no sitemap.

Os metadados, sitemap e redirecionamentos usam `https://stelusbordados.com.br/` sem `www`. Se o domínio final mudar, atualize as URLs absolutas dos HTMLs, `robots.txt`, `sitemap.xml` e `.htaccess` antes de publicar. O `.htaccess` exige Apache com `mod_rewrite`; compressão e cache dependem dos módulos opcionais `mod_deflate` e `mod_expires`.

O site usa apenas HTML, CSS, JavaScript, fontes e imagens locais. O contato é feito por links de WhatsApp e e-mail; não há envio de formulário nem backend.
