# Instruções para Adicionar Infográficos

## Imagens Necessárias

Para que os infográficos apareçam nas páginas de serviços, salve as imagens anexadas no diretório `/public/` com os seguintes nomes:

### 1. Infográfico de Blefaroplastia (Protocolo Pré e Pós)
- **Arquivo da imagem:** A imagem com título "Protocolo Pré e Pós-Blefaroplastia com Jato de Plasma: Prevenção da Hiperpigmentação Pós-Inflamatória (HIP)"
- **Salvar como:** `/public/infografico_protocolo_blefaroplastia_plasma.jpg`
- **Página:** `/servicos/blefaroplastia-jato-plasma`

### 2. Infográfico de Xantelasma (Guia de Tratamento)
- **Arquivo da imagem:** A imagem com título "Tratamento de Xantelasma com Jato de Plasma: Um Guia para Pacientes da Clínica Saraiva Vision"
- **Salvar como:** `/public/infografico_tratamento_xantelasma.jpg`
- **Página:** `/servicos/remocao-xantelasma`

## Comando para salvar (se tiver os arquivos)

```bash
# Renomear/copiar os arquivos para os nomes corretos
cp /caminho/para/imagem_blefaroplastia.jpg /home/saraiva-vision-site/public/infografico_protocolo_blefaroplastia_plasma.jpg
cp /caminho/para/imagem_xantelasma.jpg /home/saraiva-vision-site/public/infografico_tratamento_xantelasma.jpg
```

## Verificar se os arquivos estão corretos

```bash
ls -la /home/saraiva-vision-site/public/infografico*
```

## Após adicionar os arquivos

As imagens aparecerão automaticamente nas respectivas páginas de serviços após reiniciar o servidor de desenvolvimento ou fazer deploy.
