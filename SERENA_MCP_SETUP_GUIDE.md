# Guia de Instalação do Serena MCP para integração com VSCode (contexto "ide-assistant")

1. **Pré-requisitos**
   - Tenha o [VSCode](https://code.visualstudio.com/) instalado.
   - Tenha o Python instalado em sua máquina.
   - Instale o gerenciador [uv](https://docs.astral.sh/uv/getting-started/installation/), que será usado para rodar o Serena.
   - (Opcional) Instale o Docker se preferir rodar Serena isolado do seu sistema.

2. **Instale o Serena localmente**

   ```bash
   git clone https://github.com/oraios/serena
   cd serena
   ```

3. **Rodando o MCP Server do Serena**
   - Pelo `uv`, diretamente com:

     ```bash
     uv run serena start-mcp-server --context ide-assistant
     ```

     *Ou*, se usar o repositório remoto (não requer clone):

     ```bash
     uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant
     ```

   - Se quiser usar Docker:

     ```bash
     docker run --rm -i --network host -v /CAMINHO/SEUS/PROJETOS:/workspaces/projects ghcr.io/oraios/serena:latest serena start-mcp-server --transport stdio
     ```

4. **Configuração de integração no VSCode**
   - Instale uma extensão de cliente MCP (como [Cline](https://github.com/roochin/cline) ou [Cursor](https://www.cursor.so/) que permita adicionar servidores MCP customizados).
   - Nas configurações do cliente MCP, adicione um novo servidor MCP apontando para o comando de inicialização do Serena, por exemplo:
     - Com `uvx`:

       ```text
       Command: uvx
       Args: --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant
       ```

     - Com Docker:

       ```text
       Command: docker
       Args: run --rm -i --network host -v /CAMINHO/SEUS/PROJETOS:/workspaces/projects ghcr.io/oraios/serena:latest serena start-mcp-server --transport stdio
       ```

5. **(Opcional) Personalização**
   - Edite `~/.serena/serena_config.yml` para ajustes específicos de ferramentas, contexto e modo.
   - No projeto, será criada a configuração `.serena/project.yml` na primeira execução.

6. **Ativação do Projeto**
   - Ative o projeto manualmente no assistente, pedindo para "Ativar o projeto [nome]".

7. **Dashboard**
   - O Serena disponibiliza um painel web local em `http://localhost:24282/dashboard/index.html` por padrão para logs e monitoramento.

***

**Resumo dos Comandos:**

- Instalação e execução base:

  ```bash
  uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant
  ```

- Configurar o cliente MCP/VSCode para usar este comando como servidor.

Com isso, o Serena estará pronto para uso integrado ao seu ambiente de programação moderno e ao Copilot/Agentes em IDEs compatíveis via MCP![1]

[1](https://github.com/oraios/serena)
