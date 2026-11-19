const http = require('http')
const fs = require('fs')
const path = require('path')

const {
    LIMITE_BARALHO,
    listarBaralho,
    contarBaralho,
    salvarPokemonBaralho,
    removerPokemonBaralho
} = require('./script_db.js')

const PORTA = process.env.PORT || 3002

const arquivos = {
    '/': { arquivo: 'index.html', tipo: 'text/html; charset=UTF-8' },
    '/index.html': { arquivo: 'index.html', tipo: 'text/html; charset=UTF-8' },
    '/script.js': { arquivo: 'script.js', tipo: 'text/javascript; charset=UTF-8' },
    '/style.css': { arquivo: 'style.css', tipo: 'text/css; charset=UTF-8' }
}

function responderJSON(res, status, dados) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=UTF-8' })
    res.end(JSON.stringify(dados))
}

function lerCorpo(req) {
    return new Promise((resolve, reject) => {
        let corpo = ''

        req.on('data', pedaco => {
            corpo += pedaco
        })

        req.on('end', () => {
            try {
                resolve(JSON.parse(corpo || '{}'))
            } catch (erro) {
                reject(erro)
            }
        })

        req.on('error', reject)
    })
}

const servidor = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        res.writeHead(204)
        return res.end()
    }

    try {
        if (req.url === '/api/baralho' && req.method === 'GET') {
            const linhas = await listarBaralho()
            if (linhas === null) {
                return responderJSON(res, 500, { erro: 'Erro ao listar o baralho' })
            }
            return responderJSON(res, 200, linhas)
        }

        if (req.url === '/api/baralho' && req.method === 'POST') {
            const pokemon = await lerCorpo(req)

            if (!pokemon.nome || !pokemon.treinador) {
                return responderJSON(res, 400, { erro: 'Nome do Pokémon e treinador são obrigatórios' })
            }

            const resultado = await salvarPokemonBaralho(pokemon)

            if (!resultado.sucesso) {
                const status = resultado.erro.includes('já está') ? 409 : 400
                return responderJSON(res, status, { erro: resultado.erro })
            }

            return responderJSON(res, 201, resultado.pokemon)
        }

        if (req.url.startsWith('/api/baralho/') && req.method === 'DELETE') {
            const nome = decodeURIComponent(req.url.slice('/api/baralho/'.length))
            const removido = await removerPokemonBaralho(nome)

            if (!removido) {
                return responderJSON(res, 404, { erro: 'Pokémon não encontrado' })
            }

            return responderJSON(res, 200, { sucesso: true })
        }

        if (req.url === '/api/baralho/limite' && req.method === 'GET') {
            const total = await contarBaralho()
            return responderJSON(res, 200, {
                limite: LIMITE_BARALHO,
                total
            })
        }

        const rota = arquivos[req.url]
        if (rota) {
            res.writeHead(200, { 'Content-Type': rota.tipo })
            return fs.createReadStream(path.join(__dirname, rota.arquivo)).pipe(res)
        }

        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' })
        res.end('Página não encontrada')
    } catch (erro) {
        responderJSON(res, 500, { erro: 'Erro interno no servidor' })
    }
})

servidor.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`)
})