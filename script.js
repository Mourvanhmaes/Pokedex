let m_poke_id = 0;
let m_pagina = 1;
let m_evo = [];
let m_aux_evo = 0;
let m_dica_aux = 0;
let m_jogo_id = 0;
let m_cont_menu = 0;
let m_h_lupa = 0;
let m_posicao_carrousel = 0;
let m_c_vetor = [];
let m_vetor_marcados = [];
function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
}
function getTeams() {
    return JSON.parse(localStorage.getItem('teams') || '[]');
}
function toggleTeam(id, btn) {
    let teams = getTeams();
    let isTeam = teams.includes(id);
    if (isTeam) {
        teams = teams.filter(t => t !== id);
        btn.innerHTML = '☆';
        btn.style.color = 'gray';
    } else {
        teams.push(id);
        btn.innerHTML = '★';
        btn.style.color = 'gold';
    }
    localStorage.setItem('teams', JSON.stringify(teams));
}

function m_toggle_favorite(id, btn) {
    let favorites = getFavorites();
    let isFav = favorites.includes(id);
    if (isFav) {
        favorites = favorites.filter(f => f !== id);
        btn.innerHTML = '♡';
        btn.style.color = 'gray';
    } else {
        favorites.push(id);
        btn.innerHTML = '♥';
        btn.style.color = 'red';
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

async function m_show_favorites() {
    let favorites = getFavorites();
    if (favorites.length === 0) {
        document.querySelector(".m_cards").innerHTML = "<p>Nenhum Pokémon favorito adicionado ainda.</p>";
        return;
    }
    let pokemon = document.querySelector(".m_cards");
    pokemon.innerHTML = "";
    for (let id of favorites) {
        let resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        let dados = await resposta.json();
        let img = dados.sprites.other['official-artwork'].front_default;
        let tipos = dados.types.map(t => t.type.name);
        let heart = '♥';
        let heartColor = 'red';
        pokemon.innerHTML += `
            <div class="m_card" onclick="m_enviar_dados(${dados.id})" style="position: relative;">
                <div class="m_card_id">
                    <h5>#${String(dados.id).padStart(3, "0")}</h5>
                </div>
                <div class="m_card_info">
                    <img src="${img}" alt="${dados.name}">
                    <h3>${dados.name}</h3>
                    <div class="m_poke_tipo">
                        ${tipos.map(t => `<h4 class="m_${t}">${t}</h4>`).join('')}
                    </div>
                </div>
                <button class="m_heart_btn" title="Favoritar Pokémon" onclick="m_toggle_favorite(${dados.id}, this); event.stopPropagation();" style="border-radius: 50%; width: 30px; height: 30px; border: none; background-color: rgba(255, 255, 255, 0.7); font-size: 16px; cursor: pointer; position: absolute; top: 5px; left: 5px; color: ${heartColor};">${heart}</button>
            </div>
        `;
    }
    let header = document.querySelector(".m_barra_pesq"); // Ajustar seletor conforme HTML
    if (!document.getElementById("back_to_list")) {
        let backBtn = document.createElement("button");
        backBtn.id = "back_to_list";
        backBtn.innerHTML = "Voltar à Lista";
        backBtn.onclick = () => m_index_poke(m_calculo_pag());
        backBtn.style.margin = "10px";
        header.appendChild(backBtn);
    }
}

async function m_busca_pokemon(n){
    m_poke_id = n;
    let antes = n - 1;
    let prox = n + 1;
    if(antes < 1){
        antes = 1025;
    }
    if(prox > 1025){
        prox = 1;
    }
    let pokemon = document.querySelector(".m_pag_poke");
    let resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${n}`);
    let dados = await resposta.json();
    let img = dados.sprites.other['official-artwork'].front_default;
    let tipos = dados.types.map(t => t.type.name);
    let habilidades = dados.abilities.map(h => h.ability.name);
    let fraquezas = [];
    // pegar o anterior e o proximo
    let resp_ante = await fetch(`https://pokeapi.co/api/v2/pokemon/${antes}`);
    let resp_prox = await fetch(`https://pokeapi.co/api/v2/pokemon/${prox}`);
    let dados_ante = await resp_ante.json();
    let dados_prox = await resp_prox.json();
    let img_ante = dados_ante.sprites.other['official-artwork'].front_default;
    let tipos_ante = dados_ante.types.map(t => t.type.name);
    let img_prox = dados_prox.sprites.other['official-artwork'].front_default
    let tipos_prox = dados_prox.types.map(t => t.type.name);
    // descrição
    let resdes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${n}`);
    let dados_esp = await resdes.json();
    let descricao = dados_esp.flavor_text_entries[0].flavor_text;
    switch(tipos[0]) {
        case "normal": fraquezas.push("fighting"); break;
        case "fire": fraquezas.push("water", "ground", "rock"); break;
        case "water": fraquezas.push("electric", "grass"); break;
        case "electric": fraquezas.push("ground"); break;
        case "grass": fraquezas.push("fire", "ice", "poison", "flying", "bug"); break;
        case "ice": fraquezas.push("fire", "fighting", "rock", "steel"); break;
        case "fighting": fraquezas.push("flying", "psychic", "fairy"); break;
        case "poison": fraquezas.push("ground", "psychic"); break;
        case "ground": fraquezas.push("water", "ice", "grass"); break;
        case "flying": fraquezas.push("electric", "ice", "rock"); break;
        case "psychic": fraquezas.push("bug", "ghost", "dark"); break;
        case "bug": fraquezas.push("fire", "flying", "rock"); break;
        case "rock": fraquezas.push("water", "grass", "fighting", "ground", "steel"); break;
        case "ghost": fraquezas.push("ghost", "dark"); break;
        case "dragon": fraquezas.push("ice", "dragon", "fairy"); break;
        case "dark": fraquezas.push("fighting", "bug", "fairy"); break;
        case "steel": fraquezas.push("fire", "fighting", "ground"); break;
        case "fairy": fraquezas.push("poison", "steel"); break;
        default: break;
    }
    let favorites = getFavorites();
    let isFav = favorites.includes(dados.id);
    let heart = isFav ? '♥' : '♡';
    let heartColor = isFav ? 'red' : 'gray';
    let teams = getTeams();
    let isTeam = teams.includes(dados.id);
    let star = isTeam ? '★' : '☆';
    let starColor = isTeam ? 'gold' : 'gray';
    pokemon.innerHTML = `
        <div class="m_barra_pesq">
            <img src="img/lupa.svg" alt="lupa">
            <input type="text" placeholder="Buscar Pokémon por nome, numero...." id="m_pesquisa">
            <button onclick="m_pesquisa()">Buscar</button>
        </div>
        <div class="m_poke_titulo">
            <h2>Pokémon</h2>
        </div>
        <div class="m_poke_pricipal">
            <img src="img/caret-left.svg" alt="seta esquerda" class="m_poke_setas" onclick="m_poke_antes()">
            <div class="m_poke_pokemon">
                <img src="img/master_ball.svg" alt="master_ball" class="m_poke_master">
                <div class="m_poke_pokemon_img">
                    <span></span>
                    <img src="${img}" alt="${dados.name}">
                </div>
                <div class="m_poke_dados">
                    <div class="m_poke_nome">
                        <h1>${dados.name}</h1>
                        <h2>#${String(dados.id).padStart(3, "0")}</h2>
                    </div>
                    <div class="m_poke_tipo">
                        ${tipos.map(t => `<h4 class="m_${t}">${t}</h4>`).join('')}
                    </div>
                    <p>${descricao}</p>
                    <div class="m_poke_medidas">
                        <h4 class="m_poke_medidas_wt"><span>WT</span>${dados.weight / 10}KG</h4>
                        <h4 class="m_poke_medidas_ht"><span>HT</span>${dados.height / 10}m</h4>
                    </div>
                    <div class="m_poke_fraq">
                        <h3>Franquezas</h3>
                        <div class="m_poke_tipo">
                            ${fraquezas.map(t => `<h4 class="m_${t}">${t}</h4>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="m_poke_habilit">
                    <h3>Habilidades</h3>
                    ${habilidades.map(h => `<p>${h}</p>`).join(" ")}
                </div>
                <div class="m_poke_estrelas">
                    <div class="m_heart_btn" title="Favoritar Pokémon" onclick="m_toggle_favorite(${dados.id}, this); event.stopPropagation();" style="color: ${heartColor};">${heart}</div>
                    <div class="m_star_btn" title="Adicionar ao Time" onclick="toggleTeam(${dados.id}, this); event.stopPropagation();" style="color: ${starColor};">${star}</div>
                </div>
            </div>
            <img src="img/caret-right.svg" alt="seta direita" class="m_poke_setas" onclick="m_poke_prox()">
        </div>
        <div class="m_poke_extras">
            <div class="m_poke_sequencia">
                <div class="m_poke_seq_titulo">
                    <h1>Sequencia</h1>
                    <div class="m_poke_extras_setas">
                        <img src="img/caret-left.svg" alt="esquerda" onclick="m_poke_antes()">
                        <img src="img/caret-right.svg" alt="direita" onclick="m_poke_prox()">
                    </div>
                </div>
                <div class="m_poke_cards">
                    <div class="m_poke_card m_${tipos_ante[0]}" onclick="m_busca_pokemon(${m_poke_id - 1})">
                        <img src="${img_ante}" alt="${dados_ante.name}">
                        <div class="m_poke_card_des">
                            <h3>${dados_ante.name}</h3>
                            <h4>#${String(dados_ante.id).padStart(3, "0")}</h4>
                        </div>
                    </div>
                    <div class="m_poke_card m_${tipos[0]}">
                        <img src="${img}" alt="${dados.name}">
                        <div class="m_poke_card_des">
                            <h3>${dados.name}</h3>
                            <h4>#${String(dados.id).padStart(3, "0")}</h4>
                        </div>
                    </div>
                    <div class="m_poke_card m_${tipos_prox[0]}" onclick="m_busca_pokemon(${m_poke_id + 1})">
                        <img src="${img_prox}" alt="${dados_prox.name}">
                        <div class="m_poke_card_des">
                            <h3>${dados_prox.name}</h3>
                            <h4>#${String(dados_prox.id).padStart(3, "0")}</h4>
                        </div>
                    </div>
                </div>
            </div>
            <div class="m_poke_evo"></div>
        </div>
    `;
    let poke_cor = document.querySelector(".m_poke_pokemon_img span");
    poke_cor.style.backgroundColor = `var(--${tipos[0]})`;
    // evolução
    let evolucao = await fetch(dados_esp.evolution_chain.url).then(r => r.json());
    let atual = evolucao.chain;
    let cont_evo = 0;
    while(atual){
        cont_evo++;
        await m_busca_evo(atual.species.name);
        atual = atual.evolves_to[0];
    }
    m_busca_evo(null);
    m_evo = [];
    document.getElementById("m_pesquisa").addEventListener("keydown", function(m_enter) {
    if (m_enter.key === "Enter") {
        m_pesquisa();
    }
});
}
function m_poke_antes(){
    if(m_poke_id < 1){
        m_poke_id = 1025;
    }
    else{
        m_poke_id -= 1;
    }
    m_busca_pokemon(m_poke_id);
}
function m_poke_prox(){
    if(m_poke_id > 1024){
        m_poke_id = 1;
    }
    else{
        m_poke_id += 1;
    }
    m_busca_pokemon(m_poke_id);
}
async function m_index_poke(n){
    if((n - 25) <= 0){
        incial = 1;
    }
    else{
        incial = n - 24;
    }
    let favorites = getFavorites();
    for(let i = incial; i <= n; i++){
        let pokemon = document.querySelector(".m_cards");
        let resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
        let dados = await resposta.json();
        let img = dados.sprites.other['official-artwork'].front_default;
        let tipos = dados.types.map(t => t.type.name);
        let isFav = favorites.includes(dados.id);
        let heart = isFav ? '♥' : '♡';
        let heartColor = isFav ? 'red' : 'gray';
        pokemon.innerHTML += `
            <div class="m_card" onclick="m_enviar_dados(${dados.id})" style="position: relative;">
                <div class="m_card_id">
                    <h5>#${String(dados.id).padStart(3, "0")}</h5>
                </div>
                <div class="m_card_info">
                    <img src="${img}" alt="${dados.name}">
                    <h3>${dados.name}</h3>
                    <div class="m_poke_tipo">
                        ${tipos.map(t => `<h4 class="m_${t}">${t}</h4>`).join('')}
                    </div>
                </div>
                <button class="m_heart_btn" title="Favoritar Pokémon" onclick="m_toggle_favorite(${dados.id}, this); event.stopPropagation();" style="border-radius: 50%; width: 30px; height: 30px; border: none; background-color: rgba(255, 255, 255, 0.7); font-size: 16px; cursor: pointer; position: absolute; top: 5px; left: 5px; color: ${heartColor};">${heart}</button>
            </div>
        `;
    }
    document.getElementById("m_pesquisa_poke").addEventListener("keydown", function(m_enter2) {
    if (m_enter2.key === "Enter") {
        m_pesquisa_poke();
    }
    });
}
function m_enviar_dados(dados){
    localStorage.setItem("dados", dados);
    window.location.href = "pokemon.html";
}

async function m_busca_id(){
    let id = localStorage.getItem("dados");
    if(!id || id == ""){
        m_poke_id = 1;
    }
    else if (!isNaN(id)){
        let n = Number(id);
        if(n < 0) n = 1;
        m_poke_id = n;
    }
    else{
        let resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        let dados = await resposta.json();
        m_poke_id = dados.id;
    }
    m_busca_pokemon(m_poke_id);
}
function m_calculo_pag(){
    return m_pagina * 25;
}
function m_up_pag(n){
    let pokemon = document.querySelector(".m_cards");
    pokemon.innerHTML = " ";
    if(n == 0){
        if(m_pagina <= 1){
            m_pagina = 41;
            m_index_poke(m_calculo_pag());
        }
        else{
            m_pagina--;
            m_index_poke(m_calculo_pag());
        }
    }
    else if(n == 1){
        if(m_pagina >= 41){
            m_pagina = 1;
            m_index_poke(m_calculo_pag());
        }
        else{
            m_pagina++;
            m_index_poke(m_calculo_pag());
        }
    }
    document.getElementById("m_pag_num").innerHTML = m_pagina;
}
function m_up_pag_filtros(n){
    let pokemon = document.querySelector(".m_cards");
    pokemon.innerHTML = " ";
    if(n == 0){
        if(m_pagina <= 1){
            m_pagina = 41;
            m_filtrar(m_calculo_pag());
        }
        else{
            m_pagina--;
            m_filtrar(m_calculo_pag());
        }
    }
    else if(n == 1){
        if(m_pagina >= 41){
            m_pagina = 1;
            m_filtrar(m_calculo_pag());
        }
        else{
            m_pagina++;
            m_filtrar(m_calculo_pag());
        }
    }
    document.getElementById("m_pag_num").innerHTML = m_pagina;
}

async function m_busca_evo(nome){
    let poke = document.querySelector(".m_poke_evo");
    m_aux_evo++;
    let resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`);
    let dados = await resposta.json();
    let img = dados.sprites.other['official-artwork'].front_default;
    m_evo.push({
        id: dados.id,
        nome: dados.name,
        img: img,
        tipos: dados.types.map(t => t.type.name)
    });
    poke.innerHTML = `
    <div class="m_poke_evo_titulo">
        <h1>Evoluções Registradas</h1>
        <br>
        <p>Da sua forma inicial até seu auge, cada evolução conta uma nova história</p>
    </div>
    <div class="m_poke_evo_quadrado">
        ${m_evo.map((evo, index) => `
            <div class="m_poke_evo_card" onclick="m_busca_pokemon(${evo.id})">
                <img src="${evo.img}" alt="${evo.nome}">
                <div class="m_poke_evo_card_nome">
                    <h5>${evo.nome}</h5>
                    <div class="m_poke_tipo">
                        ${evo.tipos.map(t => `<h4 class="m_${t}">${t}</h4>`).join("")}
                    </div>
                </div>
            </div>
            ${index < m_evo.length - 1 ? `<img src="img/evolu.svg" alt="evolucao" id="m_evo_seta"> <img src="img/evo_baixo.svg" alt="evolucao" id="m_evo_baixo">` : ""}
        `).join("")}
    </div>`;
}
async function m_pesquisa(n){
    let m_pesq = document.getElementById("m_pesquisa").value;
    let resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${m_pesq}`);
    let dados = await resposta.json();
    m_busca_pokemon(dados.id);
}
function m_gerador(n, q){
    let numero;
    do {
        numero = Math.floor(Math.random() * q) + 1;
    } while (numero === n);
    return numero;
}
async function m_jogo_poke(){
    let pokemon = document.querySelector(".m_jogo_principal");
    let dica_tipo = document.querySelector(".m_dica_tipo");
    let busca_1 = m_gerador(0, 999);
    let resposta_1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${busca_1}`);
    let dados_1 = await resposta_1.json();
    let img = dados_1.sprites.other['official-artwork'].front_default;
    let tipos = dados_1.types.map(t => t.type.name);
    m_jogo_id = dados_1.id;
    pokemon.innerHTML = `
        <div class="m_jogo_poke">
            <img src="${img}" alt="${dados_1.name}">
        </div>
        <div class="m_jogo_op">                 
        </div>
        `;
    dica_tipo.innerHTML = `
        <div class="m_poke_tipo">
            ${tipos.map(t => `<h4 class="m_${t}">${t}</h4>`).join('')}
        </div>
        `;
    let op = document.querySelector(".m_jogo_op");
    let aux_certo = 0;
    let certo = Math.floor(Math.random() * 4);;
    for(let i = 0; i < 4; i++){
        let busca_2 = m_gerador(busca_1, 1025 );
        let resposta_2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${busca_2}`);
        let dados_2 = await resposta_2.json();
        let nome = null;
        if(certo == i){
            nome = dados_1.name;
            aux_certo = 1;
        }
        else{
            nome = dados_2.name;
            aux_certo = 0;
        }
        switch(i){
            case 0:
                op.innerHTML += `
                    <div class="m_op" onclick="m_opcao(${aux_certo})">
                        <h2>A</h2>
                        <h3>${nome}</h3>
                    </div>
                `;
                break;
            case 1:
                op.innerHTML += `
                    <div class="m_op" onclick="m_opcao(${aux_certo})">
                        <h2>B</h2>
                        <h3>${nome}</h3>
                    </div>
                `;
                break;
            case 2:
                op.innerHTML += `
                    <div class="m_op" onclick="m_opcao(${aux_certo})">
                        <h2>C</h2>
                        <h3>${nome}</h3>
                    </div>
                `;
                break;
            case 3:
                op.innerHTML += `
                    <div class="m_op" onclick="m_opcao(${aux_certo})">
                        <h2>D</h2>
                        <h3>${nome}</h3>
                    </div>
                `;
                break;
        };    
    }
}
function m_opcao(resp){
    if(resp == 1){
        alert("acertou");
        document.getElementById("m_trofeu").innerHTML++;
        m_dica_aux = 0;
        document.getElementById("m_dica").innerHTML = 0; 
        m_jogo_poke();
    }
    else{
        alert("Errou");
        document.getElementById("m_erros").innerHTML++;
    }
}
function m_dica(){
    let pokemon = document.querySelector(".m_jogo_poke img");
    let tipo = document.querySelectorAll(".m_dica_tipo .m_poke_tipo h4");
    if(m_dica_aux == 0){
        pokemon.style.filter = "brightness(1)";
        document.getElementById("m_dica").innerHTML = 1; 
        m_dica_aux = 1;
        return;
    }
    if(m_dica_aux == 1){
        m_dica_aux = 2; 
        document.getElementById("m_dica").innerHTML = 2;
        tipo[0].style.filter = "brightness(1)";
        if(tipo.length > 0){
            tipo[1].style.filter = "brightness(1)";
        }
        return;
    }
    if(m_dica_aux == 2){
        window.scrollTo({ top: 0, behavior: 'smooth' });
        m_alert_dica();
        return;
    }
}
function m_alert_dica(){
    let alerta = document.querySelector(".m_jogo_alert");
    alerta.style.display = "flex";
    let jogo = document.querySelector(".m_jogo");
    jogo.style.transition = "filter 0.5s";
    jogo.style.filter = "blur(10px)";
    jogo.style.pointerEvents = "none";
}
function m_dica_op(n){
    if(n == 0){
        let alerta = document.querySelector(".m_jogo_alert");
        alerta.style.display = "none";
        let jogo = document.querySelector(".m_jogo");
        jogo.style.transition = "none";
        jogo.style.filter = "blur(0)";
        jogo.style.pointerEvents = "auto";
    }
    else if(n == 1){
        m_dica_aux = 0;
        m_enviar_dados(m_jogo_id);
        window.location.href = "pokemon.html";
    }
}
function m_aplicar_filtrar(){
    m_pagina = 1;
    m_filtrar(m_calculo_pag());
}
async function m_filtrar(n){
    let pokemon = document.querySelector(".m_cards");
    let aux_pag = 0;
    pokemon.innerHTML = " ";
    let tipo = document.getElementById("tipos").value;
    if(tipo == "nada"){
        window.location.reload();
    }
    let resposta = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
    let dados1 = await resposta.json();
    if((n - 25) <= 0){
        incial = 0;
        aux_pag = 1;
    }
    else{
        incial = n - 24;
        aux_pag = 0;
    }
    let favorites = getFavorites();
    
    for(let i = incial; i <= n - aux_pag; i++){
        let poke_tipo = dados1.pokemon[i].pokemon.name;
        let resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${poke_tipo}`);
        let dados = await resposta.json();
        let img = dados.sprites.other['official-artwork'].front_default;
        let tipos = dados.types.map(t => t.type.name);
        let isFav = favorites.includes(dados.id);
        let heart = isFav ? '♥' : '♡';
        let heartColor = isFav ? 'red' : 'gray';
        pokemon.innerHTML += `
            <div class="m_card" onclick="m_enviar_dados(${dados.id})" style="position: relative;">
                <div class="m_card_id">
                    <h5>#${String(dados.id).padStart(3, "0")}</h5>
                </div>
                <div class="m_card_info">
                    <img src="${img}" alt="${dados.name}">
                    <h3>${dados.name}</h3>
                    <div class="m_poke_tipo">
                        ${tipos.map(t => `<h4 class="m_${t}">${t}</h4>`).join('')}
                    </div>
                </div>
                <button class="m_heart_btn" title="Favoritar Pokémon" onclick="m_toggle_favorite(${dados.id}, this); event.stopPropagation();" style="border-radius: 50%; width: 30px; height: 30px; border: none; background-color: rgba(255, 255, 255, 0.7); font-size: 16px; cursor: pointer; position: absolute; top: 5px; left: 5px; color: ${heartColor};">${heart}</button>
            </div>
        `;
    }
    let pag = document.querySelector(".m_num_pag");
    pag.innerHTML = `
        <img src="img/caret-left.svg" alt="seta esquerda" onclick="m_up_pag_filtros(0)">
        <h3><span id="m_pag_num">${m_pagina}</span> de 41</h3>
        <img src="img/caret-right.svg" alt="seta direita" onclick="m_up_pag_filtros(1)">
    `;

}
function m_tocar_quem(){
    let musica = new Audio('audio/quem_poke.mp3');
    musica.play();
}
async function m_pesquisa_poke(){
    let m_pesq = document.getElementById("m_pesquisa_poke").value;
    if(m_pesq == ""){
        m_index_poke(m_calculo_pag());
    }
    let pokemon = document.querySelector(".m_cards");
    pokemon.innerHTML = "";
    let resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${m_pesq}`);
    if(!resposta.ok){
        pokemon.innerHTML = "Nenhum Pokemon encontrado tente novamente!!";
        return;
    }
    let dados = await resposta.json();
    let img = dados.sprites.other['official-artwork'].front_default;
    let tipos = dados.types.map(t => t.type.name);
    let favorites = getFavorites();
    let isFav = favorites.includes(dados.id);
    let heart = isFav ? '♥' : '♡';
    let heartColor = isFav ? 'red' : 'gray';
    pokemon.innerHTML += `
       <div class="m_card" onclick="m_enviar_dados(${dados.id})" style="position: relative;">
           <div class="m_card_id">
               <h5>#${String(dados.id).padStart(3, "0")}</h5>
           </div>
           <div class="m_card_info">
               <img src="${img}" alt="${dados.name}">
               <h3>${dados.name}</h3>
                <div class="m_poke_tipo">
                    ${tipos.map(t => `<h4 class="m_${t}">${t}</h4>`).join('')}
                </div>
            </div>
            <button class="m_heart_btn" title="Favoritar Pokémon" onclick="m_toggle_favorite(${dados.id}, this); event.stopPropagation();" style="border-radius: 50%; width: 30px; height: 30px; border: none; background-color: rgba(255, 255, 255, 0.7); font-size: 16px; cursor: pointer; position: absolute; top: 5px; left: 5px; color: ${heartColor};">${heart}</button>
        </div>
    `;
}
function m_menu_lateral(){
    let menu = document.querySelector(".m_menu_lateral");
    if(m_cont_menu == 0){
        menu.style.right = "0";
        m_cont_menu = 1;
    }
    else{
        menu.style.right = "-100%";
        m_cont_menu = 0;
    }
}
async function m_carrosel(n){
    let pokemon = document.querySelector(".m_c_cards");
    let dados;
    if(n == 1){
        for(let i = 1; i < 6; i++){
            dados = await m_busca_carrosel(0);
            m_c_vetor.push(dados.id);
            m_posicao_carrousel = i;
            pokemon.innerHTML += `
                <div class="m_c_card m_c_${i} m_card_anim" onclick="m_enviar_dados(${dados.id})">
                    <img src="${dados.img}" alt="pokemon">
                    <p>#${dados.id}</p>
                    <h2>${dados.nome}</h2>
                    <div class="m_poke_tipo">
                        ${dados.tipos.map(t => `<h4 class="m_${t}">${t}</h4>`).join('')}
                    </div>
                </div>
            `;
        }
    }
    else if(n == 2){
        for(let i = 0; i < 5; i++){
            dados = await m_busca_carrosel(m_c_vetor[i]);
            let card = document.querySelector(`.m_c_${i + 1}`);
            card.removeAttribute("onclick");
            card.onclick = () => m_enviar_dados(m_c_vetor[i]);
            card.innerHTML = `
                <img src="${dados.img}" alt="pokemon">
                <p>#${dados.id}</p>
                <h2>${dados.nome}</h2>
                <div class="m_poke_tipo">
                    ${dados.tipos.map(t => `<h4 class="m_${t}">${t}</h4>`).join('')}
                </div>
            `;
        }

    }

}

async function m_busca_carrosel(busca){
    let n;
    if (busca == 0){
       n = m_gerador(1, 900);
    }
    else{
        n = busca;
    }
    let resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${n}`);
    let dados = await resposta.json();
    let img = dados.sprites.other['official-artwork'].front_default;
    let id = dados.id;
    let nome = dados.name;
    let tipos = dados.types.map(t => t.type.name);
    return{
        id,
        nome,
        img,
        tipos
    }
}
function m_girar_vetor(){
    let primeiro = m_c_vetor.shift();
    m_c_vetor.push(primeiro);        
    m_carrosel(2);
}

async function m_times(){
    let time = getTeams();
    let cards = document.querySelector(".m_lista_times");
    if (time.length === 0) {
        cards.innerHTML = '<p class="no-teams">Nenhum Pokémon adicionado ao time ainda.</p>';
        return;
    }
    for(let id of time){
        try{
            let resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            let dados = await resposta.json();
            let img = dados.sprites.other['official-artwork'].front_default;
            let tipos = dados.types.map(t => t.type.name);
            cards.innerHTML += `
                <div class="m_t_card">
                    <div class="m_t_card_principal" onclick="m_enviar_dados(${dados.id})">
                        <input type="checkbox" name="marcar" id="m_t_marcado${dados.id}" class="m_t_marcado" value="${dados.id}" onclick="event.stopPropagation()">
                        <label for="m_t_marcado${dados.id}" class="m_t_correto" onclick="m_troca_correto(event, ${dados.id})">
                            <img src="img/correto_desmarcado.svg" alt="correto_desmarcado" class=" m_correto_desmarcado m_correto_desmarcado${dados.id}">
                            <img src="img/correto_marcado.svg" alt="correto_marcado" class="m_correto_marcado m_correto_marcado${dados.id}">
                        </label>
                        <div class="m_t_card_dados">
                            <p>#${String(dados.id).padStart(3, "0")}</p>
                            <h1>${dados.name}</h1>
                            <div class="m_poke_tipo">
                                ${tipos.map(t => `<h4 class="m_${t}">${t}</h4>`).join('')}
                            </div>
                        </div>
                        <div class="m_t_card_img m_t_${dados.id}">
                            <img src="${img}" alt="${dados.name}">
                        </div>
                    </div>
                    <div class="m_t_card_lixo">
                        <img src="img/lixeira.svg" alt="lixeira" onclick="m_excluir_time(${dados.id})">
                    </div>
                </div>

            `;
            let poke_cor = document.querySelector(`.m_t_${dados.id}`);
            poke_cor.style.backgroundColor = `var(--${tipos[0]})`;
        }
        catch(error){
            alert("Erro ao carregar os Times");
        }
    }
}
function m_troca_correto(event, id){
    event.stopPropagation()
    if(document.querySelector(`.m_correto_desmarcado${id}`).style.display != "none"){
        document.querySelector(`.m_correto_desmarcado${id}`).style.display = "none";
        document.querySelector(`.m_correto_marcado${id}`).style.display = "block";
    }
    else{
        document.querySelector(`.m_correto_desmarcado${id}`).style.display = "block";
        document.querySelector(`.m_correto_marcado${id}`).style.display = "none";        
    }

}
function m_excluir_time(id){
    let remover = JSON.parse(localStorage.getItem("teams"));
    remover = remover.filter(item => item !== id);
    localStorage.setItem("teams", JSON.stringify(remover));
    location.reload();
}
function m_excluir_time_tudo(){
    m_t_marcados();
    if(m_vetor_marcados.length === 0){
        if(confirm("Deseja excluir todos os pokemons da lista de times!!")){
            localStorage.removeItem("teams");
            location.reload();
        }
        else{
            return;
        }
    }
    else{
        if(confirm("Deseja excluir todos os pokemons selecionados!!")){
            for(let i = 0; i < m_vetor_marcados.length; i++){
                let remover = JSON.parse(localStorage.getItem("teams"));
                remover = remover.filter(item => item !== m_vetor_marcados[i]);
                localStorage.setItem("teams", JSON.stringify(remover));
            }
            m_vetor_marcados = [];
            location.reload();
        }
        else{
            return;
        }
    }
}

function getTeams() {
    return JSON.parse(localStorage.getItem('teams') || '[]');
}

// -----login-----
function m_login(){
    let email = document.getElementById("m_l_email").value;
    let senha = document.getElementById("m_l_senha").value;
    let dados;
    try{
        dados = localStorage.getItem("cadastro");
        dados = JSON.parse(dados);
    }
    catch(error){
        alert("Erro ao buscar dados");
    }
    if(email == dados.email && senha == dados.senha){
        alert("Login Bem sucedido!!!!");
        window.location.replace("index.html");
    }
    else{
        alert("Erro ao logar, ou não possui cadastro!!")
    }
}
function m_cadastro(){
    try{
        let email = document.getElementById("m_c_email").value;
        let nome = document.getElementById("m_c_nome").value;
        let senha = document.getElementById("m_c_senha").value;
        let senha2 = document.getElementById("m_c_senha2").value;
        if(senha != senha2){
            alert("As senhas não são iguais");
        }
        let cadastro = {
            email: email,
            nome: nome,
            senha: senha
        };
        let cadastro2 = JSON.stringify(cadastro);
        localStorage.setItem("cadastro", cadastro2);
    }
    catch(error){
        alert("Erro ao cadastrar!!!");
    }
    alert("Cadastro realizado com sucesso!!!!");
    window.location.href = "login.html";

}
// add favoritos na pagina pokemon
function m_add_favoritos(n){
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

window.addEventListener("scroll", function() { //fecha o menu lateral ao rolar a pagina
    let menu = document.querySelector(".m_menu_lateral");
    if (m_cont_menu == 1) {
        menu.style.right = "-100%";
        m_cont_menu = 0;
    }
});

function m_lupa_header(){
    let barra = document.querySelector(".m_h_lupa");
    if(m_h_lupa == 0){
        m_h_lupa = 1;
        barra.style.opacity = "1";
        barra.style.pointerEvents = "auto";
    }
    else{
        m_h_lupa = 0;
        barra.style.opacity = "0";
        barra.style.pointerEvents = "none";
    }
}
function m_lupa(){
    let pesquisa = document.getElementById("m_pesquisa_lupa").value;
    m_enviar_dados(pesquisa);
}


// ---------------------------marcar pokemon dos times--------------------------

function m_t_marcados(){
    m_vetor_marcados = [];
    let pokemons = document.querySelectorAll(".m_t_marcado:checked");
    pokemons.forEach(p => {
        m_vetor_marcados.push(Number(p.value));
    });
}

// rodar funções]
if (location.pathname.includes("times.html")) {
    m_times();
    document.addEventListener("mouseenter", (card) => {
        if (card.target.classList.contains("m_t_card")) {
            let lixo = card.target.querySelector(".m_t_card_lixo");
            lixo.style.marginLeft = "-5rem";
        }
    }, true);

    document.addEventListener("mouseleave", (card) => {
        if (card.target.classList.contains("m_t_card")) {
            let lixo = card.target.querySelector(".m_t_card_lixo");
            lixo.style.marginLeft = "-20rem";
        }
    }, true);

}
if (location.pathname.includes("index.html")) {
    m_index_poke(m_calculo_pag());
    m_carrosel(1);
    document.addEventListener("mouseenter", (card) => {
        let principal = document.querySelector(".m_c_3");
        if (card.target.classList.contains("m_c_card") && !card.target.classList.contains("m_c_3")) {
            card.target.style.transform = "scale(1.15)"
            card.target.style.filter = "blur(0)"
            card.target.style.zIndex = "996"
            principal.style.transform = "scale(1.08)"
            principal.style.filter = "blur(2px)"
        }
    }, true);

    document.addEventListener("mouseleave", (card) => {
        let principal = document.querySelector(".m_c_3");
        if (card.target.classList.contains("m_c_card")) {
            card.target.style.background = "";
            card.target.style.transform = ""
            card.target.style.filter = ""
            card.target.style.zIndex = ""
            principal.style.transform = ""
            principal.style.filter = ""
        }
    }, true);
    setInterval(m_girar_vetor, 3000);
}
if (location.pathname.includes("pokemon.html")) {
    m_busca_id();
}
if (location.pathname.includes("jogo.html")) {
    m_jogo_poke();  
}