# 👾 Pokémon BlackBox

Pokémon BlackBox é um dashboard avançado de planeamento estratégico e gestão de frotas de Pokémon para múltiplas gerações de jogos (Gerações 1 a 9). A aplicação funciona localmente no browser e permite aos treinadores planearem de forma cirúrgica as suas equipas competitivas, gerirem cartuchos de jogos, carimbarem passaportes de viagem entre gerações e otimizarem coberturas contra as Ligas locais de cada cartucho.

---

## 🚀 Funcionalidades Principais

### 1. 📂 Importação e Gestão de Saves
* **Importador de Saves (.sav / .main)**: Permite arrastar ou carregar ficheiros de saves de emuladores para carregar automaticamente a equipa ativa e as boxes de Pokémon. Identifica e preenche dados como Nickname, Nível, Género, Ataques, IVs, EVs, ID de Treinador (TID), ID Secreto (SID), e nome do Dono Original (OT).
* **Importador Rápido de Showdown**: Permite colar texto no formato competitivo do Pokémon Showdown ou exportações do PKHeX para registar rapidamente espécimes. Permite escolher em qual Perfil de Treinador (OT) o Pokémon importado deve ser alocado.
* **Gestão de Múltiplos Treinadores**: Cada cartucho (jogo) pode ter vários perfis de treinadores registados, com caixas de seleção dedicadas para alternar entre perfis.

### 2. ⚔️ Motor de Alocação Local e Análise Tática
* **Motor de Alocação Local**: Mapeia automaticamente a Box e a equipa ativa do treinador contra os adversários específicos da Elite Four e do Campeão do jogo ativo (Gerações 1 a 9). O motor pontua cada Pokémon com base no nível, resistências defensivas e ataques super eficazes com bónus STAB.
* **Alocação de Counter-Squads**: Recomenda e seleciona os 6 Pokémon ideais da Box para cobrir todas as ameaças da Liga. Com um único clique (`⚡ Alocar Equipa Recomendada`), a equipa ativa é atualizada.
* **Módulo de Vulnerabilidades Críticas**: Alerta automaticamente se a equipa ativa tiver fraquezas partilhadas por 3 ou mais membros contra um determinado tipo (ex: "gelo (3x fraco)").
* **Mapa de Calor de Movesets (Heatmap)**: Matriz visual na aba "Tática & Alocação" que mostra o desempenho dos movesets da equipa contra cada tipo de Pokémon.
* **Sugestões de Ajustes Cirúrgicos no Moveset**: Sugere ataques específicos (ex: TMs ou Tutores de cobertura) para membros da equipa cobrirem falhas defensivas de tipo ou preencherem slots de movimentos vazios.

### 3. 🗃️ Presets de Equipa e Partição da Box
* **Partição Tática da Box (Sem Reposição)**: Algoritmo inteligente que analisa toda a sua Box e a divide recursivamente em equipas exclusivas de 6 Pokémon (sem repetição de membros) otimizadas contra a Liga local.
* **Modal de Divisão**: Permite pré-visualizar as equipas geradas em lote, visualizar os seus sprites e tipagens, e atribuir nomes personalizados a cada equipa antes de salvar.
* **Gestão Completa de Presets (CRUD)**: Guarde as equipas geradas como presets permanentes. Permite Ativar (que move os 6 Pokémon para a equipa ativa e envia os restantes para a Box), Renomear e Eliminar presets individualmente.

### 4. ✈️ Passaporte de Viagem e Dexit Monitor
* **Guia de Transferência e Timeline**: O modal de Viagem exibe um fluxograma visual de gerações cruzadas e um guia passo-a-passo detalhado sobre como transferir os seus Pokémon de forma oficial e segura de uma geração/jogo para outra (ex: de Ruby/Sapphire até Scarlet/Violet).
* **Dexit Monitor**: Um painel dinâmico na barra lateral que lê a sua Box ativa e exibe a percentagem de compatibilidade regional dos seus Pokémon com jogos das gerações seguintes, facilitando a preparação de viagens.

### 5. 🎗️ Selo de Conquista Flexível (Auto-Ribbons)
* **Atribuição Automática de Fitas**: Ao importar um save, os Pokémon da equipa ativa recebem automaticamente a fita de Campeão correspondente àquele jogo (ex: *Champion Ribbon* em Kanto, *Sinnoh Champion Ribbon*, etc.). Pokémon de nível 100 também recebem fitas de esforço ou pegadas (*Footprint Ribbon*).
* **Toggle nas Definições**: Um interruptor no menu lateral permite ativar ou desativar esta atribuição automática de fitas, de acordo com a preferência do utilizador.

### 6. 🏆 Currículo e Registo de Desafios (Challenge Log)
* **Challenge Log**: Registo pessoal de desafios (ex: Nuzlocke, Speedrun, Ribbon Quest) com notas, título e estado de vitória/derrota/em progresso.
* **Treinador Scoped**: Os desafios estão agora estritamente associados ao **Trainer ID**, garantindo que cada perfil de treinador tenha o seu próprio diário e registo de desafios independente.
* **Linha Temporal de Jornada**: Uma timeline interativa na aba "Currículo" que exibe os jogos ativos na sua jornada, os treinadores criados, o número de Pokémon na box, vitórias no Hall of Fame e desafios concluídos para o perfil de treinador ativo de cada respetivo cartucho.

### 7. 🗑️ Função Clean Slate
* **Limpeza Completa por Treinador**: Um botão vermelho `🗑️ Clean Slate` na barra lateral permite limpar instantaneamente todos os Pokémon, presets de equipas, desafios e registos de fotos no Mural de Honra associados ao treinador ativo no jogo atual. Útil para recomeçar aventuras do zero.

---

## 🛠️ Tecnologias Utilizadas
1. **Frontend**: HTML5 Semântico, Vanilla JavaScript (ES6+), e CSS3 Moderno (Glassmorphism, gradientes harmónicos HSL, responsividade avançada).
2. **Sprites**: PokeAPI e Showdown Sprites integrados dinamicamente com suporte a sprites clássicos 2D, renders 3D (Home) e modelos 3D animados (gifs do Showdown).
3. **Persistência**: `localStorage` para a base de dados de Pokémon, presets e desafios; `IndexedDB` para armazenar registos e imagens de alta resolução do Mural de Honra (Hall of Fame).
4. **Servidor Local**: Script PowerShell (`servidor.ps1`) para servir a aplicação localmente de forma ultra-rápida.

---

## 💻 Como Executar Localmente

1. Execute o ficheiro de lote `abrir_com_servidor.bat` ou inicie o servidor via PowerShell com o comando:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\servidor.ps1
   ```
2. A aplicação abrirá automaticamente no seu navegador padrão no endereço: **http://localhost:8000/**.
