#!/bin/bash
cd /home/saraiva-vision-site/sanity

# Selecionar opção 3 (Create new studio hostname) e depois enviar "saraivavision"
(echo -e "\x1B[B\x1B[B"; sleep 1; echo "saraivavision") | npx sanity deploy --yes
