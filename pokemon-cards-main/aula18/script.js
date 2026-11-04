const form = document.querySelector('#form-pokemon');
const inputNome = document.querySelector('#nome');
const inputTreinador = document.querySelector('#treinador');
const inputTipo = document.querySelector('#tipo');
const inputCp = document.querySelector('#cp');
const feedback = document.querySelector('#feedback');
const dadomokado = {
    name: 'Pikachu',
    base_experience: 112,
    types: [
        { slot: 1, type: { name: 'eletric'} }
    ],
    sprites: {
        front_default: './pikachu.png',
        other: {
            'official-artwork': {
                front_default: './pikachu.png'
            }
        }
    }
}

const listaCards = document.querySelector('#lista-cards'); 

let pokemonsNaArena = [];

async function buscarDadosPokemon(nome) {
    try {
        const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${nome.toLowerCase()}`);
        
        if (!resposta.ok) {
            return null;
        }
        
        return await resposta.json();
    } catch (erro) {
        return null;
    }
}

function extrairImagemPokemon(dados) {
    return dados.sprites.other['official-artwork'].front_default || dados.sprites.front_default;
}

function extrairTipoPokemon(dados) {
    return dados.types.map(item => item.type.name);
}

function extrairCombatPower(dados) {
    return dados.base_experience || 0;
}

// FUNÇÃO ATUALIZADA: MESCLAGEM PROFISSIONAL ESTILO CARTA POKÉMON
function aplicarEstiloPorTipo(card, tipos) {
    const paletaDeTipos = {
        fire: { borda: '#FF4422', cor: '#FF6B4A' },
        water: { borda: '#2980B9', cor: '#3B9EFF' },
        grass: { borda: '#3A9D3A', cor: '#47D147' },
        electric: { borda: '#D4A800', cor: '#FFD700' },
        poison: { borda: '#8E44AD', cor: '#B059D6' },
        normal: { borda: '#7F8C8D', cor: '#B5B9B4' },
        psychic: { borda: '#FF69B4', cor: '#FF5CB8' },
        ghost: { borda: '#705898', cor: '#8D6EC8' },
        flying: { borda: '#89A1F0', cor: '#92B2FF' },
        bug: { borda: '#91A119', cor: '#9ECA22' },
        ground: { borda: '#D2B055', cor: '#E0A83A' },
        rock: { borda: '#B8A038', cor: '#D1B846' },
        ice: { borda: '#70CBD4', cor: '#6EE0EC' },
        dragon: { borda: '#6F38F6', cor: '#8250FF' },
        dark: { borda: '#4C392B', cor: '#5A4F50' },
        steel: { borda: '#B8B8D0', cor: '#A0B0C0' },
        fairy: { borda: '#EA90AC', cor: '#FF99C8' },
        fighting: { borda: '#B83028', cor: '#E63935' }
    };

    const estiloPadrao = { borda: '#555555', cor: '#A0A0A0' };

    const tipo1 = tipos && tipos[0] ? tipos[0].toLowerCase() : '';
    const tipo2 = tipos && tipos[1] ? tipos[1].toLowerCase() : '';

    const estilo1 = paletaDeTipos[tipo1] || estiloPadrao;

    card.style.border = `3px solid ${estilo1.borda}`;

    if (tipo2 && paletaDeTipos[tipo2]) {
        const estilo2 = paletaDeTipos[tipo2];
        
        // Efeito com transição suave no centro (duas metades perfeitas mescladas)
        card.style.setProperty(
            'background-image', 
            `linear-gradient(110deg, ${estilo1.cor} 0%, ${estilo1.cor} 45%, ${estilo2.cor} 55%, ${estilo2.cor} 100%)`, 
            'important'
        );
    } else {
        card.style.setProperty('background-image', 'none', 'important');
        card.style.setProperty('background-color', estilo1.cor, 'important');
    }
}

function criarCardPokemon(pokemon, ehCampeao) {
    const card = document.createElement('div');
    card.classList.add('card');
    
    if (ehCampeao) {
        card.classList.add('campeao');
    }

    const tiposFormatados = pokemon.tipos.join(', ');

    card.innerHTML = `
        <h3>${ehCampeao ? '👑 ' : ''}${pokemon.nome}</h3>
        <img src="${pokemon.imagem}" alt="${pokemon.nome}" width="100">
        <p><strong>Tipo:</strong> ${tiposFormatados}</p>
        <p><strong>CP:</strong> ${pokemon.cp}</p>
        <p><strong>Treinador:</strong> ${pokemon.treinador}</p>
        <button class="btn-remover" data-nome="${pokemon.nome}">🗑️ Remover</button>
    `;

    aplicarEstiloPorTipo(card, pokemon.tipos);

    return card;
}

function renderizarArena() {
    listaCards.innerHTML = ''; 
    
    pokemonsNaArena.sort((a, b) => b.cp - a.cp);

    pokemonsNaArena.forEach((pokemon, index) => {
        const ehCampeao = (index === 0 && pokemonsNaArena.length > 0);
        const cardCriado = criarCardPokemon(pokemon, ehCampeao);
        listaCards.appendChild(cardCriado);
    });
}

async function preencherCamposAutomaticos() {
    const nome = inputNome.value.trim();

    if (!nome) {
        inputTipo.value = '';
        inputCp.value = '';
        return;
    }

    const dadosApi = await buscarDadosPokemon(nome);

    if (!dadosApi) {
        inputTipo.value = '';
        inputCp.value = '';
        return;
    }

    const tipos = extrairTipoPokemon(dadosApi);
    const cp = extrairCombatPower(dadosApi);

    inputTipo.value = tipos.join(', ');
    inputCp.value = cp;
}

inputNome.addEventListener('blur', preencherCamposAutomaticos);
inputNome.addEventListener('change', preencherCamposAutomaticos);

listaCards.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-remover')) {
        const nomeRemover = event.target.getAttribute('data-nome');
        
        pokemonsNaArena = pokemonsNaArena.filter(p => p.nome.toLowerCase() !== nomeRemover.toLowerCase());
        renderizarArena();
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nomeOriginal = inputNome.value.trim();
    const treinadorInput = inputTreinador.value.trim();

    if (!nomeOriginal || !treinadorInput) {
        feedback.textContent = '⚠️ Preencha o nome do Pokémon e do treinador.';
        feedback.style.color = 'red';
        return;
    }

    const jaExiste = pokemonsNaArena.some(p => p.nome.toLowerCase() === nomeOriginal.toLowerCase());
    if (jaExiste) {
        feedback.textContent = '❌ Esse pokemon já está na arena.';
        feedback.style.color = 'red';
        return;
    }

    feedback.textContent = 'Buscando na Pokedex...';
    feedback.style.color = 'black';

    const dadosApi = await buscarDadosPokemon(nomeOriginal);

    if (!dadosApi) {
        feedback.textContent = '❌ O pokemon não foi encontrado.';
        feedback.style.color = 'red';
        return;
    }

    const imagem = extrairImagemPokemon(dadosApi);
    const tipos = extrairTipoPokemon(dadosApi);
    const cp = extrairCombatPower(dadosApi);

    pokemonsNaArena.push({
        nome: dadosApi.name,
        imagem: imagem,
        tipos: tipos,
        cp: cp,
        treinador: treinadorInput
    });

    renderizarArena();

    feedback.textContent = '✅ Pokémon cadastrado com sucesso!';
    feedback.style.color = 'green';

    inputNome.value = '';
    inputTreinador.value = '';
    inputTipo.value = '';
    inputCp.value = '';
});