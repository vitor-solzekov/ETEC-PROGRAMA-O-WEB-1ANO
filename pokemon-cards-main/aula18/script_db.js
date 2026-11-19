require('dotenv').config({ quiet: true })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
    console.error('Defina DATABASE_URL no arquivo .env')
}

const host = DATABASE_URL ? new URL(DATABASE_URL).host : ''
const neonHttpEndpoint = `https://${host}/sql`
const LIMITE_BARALHO = 12

async function executarQueryNeon(querySQL, params = []) {
    try {
        if (!DATABASE_URL) return null

        const response = await fetch(neonHttpEndpoint, {
            method: 'POST',
            headers: {
                'Neon-Connection-String': DATABASE_URL,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: querySQL, params })
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Erro na requisição: ${response.status} - ${errorText}`)
        }

        const data = await response.json()

        if (Array.isArray(data)) return data
        if (Array.isArray(data.rows)) return data.rows
        if (Array.isArray(data.result)) return data.result
        return data
    } catch (error) {
        console.error('Erro ao executar a query:', error)
        return null
    }
}

async function listarBaralho() {
    return executarQueryNeon(
        'SELECT id, nome, img, cp, treinador, tipo1, tipo2 FROM baralho ORDER BY cp DESC'
    )
}

async function contarBaralho() {
    const resultado = await executarQueryNeon(
        'SELECT COUNT(*)::int AS total FROM baralho'
    )

    if (!Array.isArray(resultado) || resultado.length === 0) return null
    return resultado[0].total
}

async function salvarPokemonBaralho(pokemon) {
    const quantidade = await contarBaralho()
    if (quantidade === null) return { sucesso: false, erro: 'Erro ao contar o baralho' }
    if (quantidade >= LIMITE_BARALHO) {
        return { sucesso: false, erro: `O baralho aceita apenas ${LIMITE_BARALHO} Pokémons` }
    }

    const existente = await executarQueryNeon(
        'SELECT id FROM baralho WHERE LOWER(nome) = LOWER($1)',
        [pokemon.nome]
    )

    if (existente === null) return { sucesso: false, erro: 'Erro ao verificar o Pokémon' }
    if (Array.isArray(existente) && existente.length > 0) {
        return { sucesso: false, erro: 'Esse Pokémon já está no baralho' }
    }

    const resultado = await executarQueryNeon(
        `INSERT INTO baralho (id, nome, img, cp, treinador, tipo1, tipo2)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, nome, img, cp, treinador, tipo1, tipo2`,
        [
            pokemon.id,
            pokemon.nome,
            pokemon.imagem,
            pokemon.cp,
            pokemon.treinador,
            Array.isArray(pokemon.tipos) ? (pokemon.tipos[0] || null) : null,
            Array.isArray(pokemon.tipos) ? (pokemon.tipos[1] || null) : null
        ]
    )

    if (resultado === null) return { sucesso: false, erro: 'Erro ao salvar o Pokémon' }

    return { sucesso: true, pokemon: Array.isArray(resultado) ? resultado[0] : resultado }
}

async function removerPokemonBaralho(nome) {
    const resultado = await executarQueryNeon(
        'DELETE FROM baralho WHERE LOWER(nome) = LOWER($1) RETURNING id',
        [nome]
    )

    if (resultado === null) return false
    return Array.isArray(resultado) ? resultado.length > 0 : true
}

module.exports = {
    LIMITE_BARALHO,
    executarQueryNeon,
    listarBaralho,
    contarBaralho,
    salvarPokemonBaralho,
    removerPokemonBaralho
}

