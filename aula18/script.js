const form = document.querySelector("#IdFormulario");
const feedback = document.querySelector("#IdFeedback");
const nome = document.querySelector("#nome");
const botaolimpar = document.querySelector("#botaolimpar");
const listaCards = document.querySelector("#lista-cards");

const URL_POKEAPI = "https://pokeapi.co/api/v2/pokemon";


/* BUSCAR POKÉMON NA API */

async function buscarDadosPokemon(nomePokemon) {

    const nomeFormatado = nomePokemon.trim().toLowerCase();

    try {

        const resposta = await fetch(
            `${URL_POKEAPI}/${nomeFormatado}`
        );

        if (!resposta.ok) {
            throw new Error("Pokémon não encontrado");
        }

        return await resposta.json();

    } catch (error) {

        console.log(
            "Não foi possível carregar os dados do Pokémon:",
            error
        );

        return null;
    }
}


/* ENVIAR FORMULÁRIO */

form.addEventListener("submit", async function (event) {

    event.preventDefault();

    /* Verifica o nome */

    if (nome.value.trim().length < 3) {

        feedback.textContent =
            "Deve conter ao menos 3 caracteres";

        feedback.style.color = "#ef4444";

        return;
    }


    /* Busca o Pokémon */

    const dadosAPI =
        await buscarDadosPokemon(nome.value);


    /* Pokémon não encontrado */

    if (!dadosAPI) {

        feedback.textContent =
            "Pokémon não encontrado!";

        feedback.style.color = "#ef4444";

        return;
    }


    /* Cria o card */

    criarCardPokemon(dadosAPI);


    /* Mensagem */

    feedback.textContent =
        "Pokémon cadastrado!";

    feedback.style.color =
        "#22c55e";


    /* Limpa o nome */

    nome.value = "";
});


/* CRIAR CARD DO POKÉMON */

function criarCardPokemon(dados) {

    const imagem =
        dados.sprites?.other?.["official-artwork"]?.front_default;

    const nomePokemon =
        dados.name;

    const card =
        document.createElement("div");


    card.classList.add("card-pokemon");


    card.innerHTML = `
        <img
            src="${imagem}"
            alt="${nomePokemon}"
        >

        <h2>
            ${nomePokemon}
        </h2>
    `;


    listaCards.appendChild(card);
}


/* VALIDAÇÃO DO NOME */

nome.addEventListener("input", function () {

    const valornome =
        nome.value.trim();


    if (valornome.length < 3) {

        feedback.textContent =
            "Deve conter ao menos 3 caracteres";

        feedback.style.color =
            "#ef4444";

    } else {

        feedback.textContent = "";
    }

});


/* BOTÃO CANCELAR */

botaolimpar.addEventListener("click", function () {

    feedback.textContent =
        "Formulário limpo.";

    feedback.style.color =
        "#22c55e";
});