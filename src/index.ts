import express, {Express, Request, Response} from 'express'
import { Database } from "sqlite3"

const app : Express = express()
const port : number = 3000

const db = new Database(':memory:')


//Pode-se criar um tipo específico para este registro, retornar na lista de GET
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS carbon_footprint
            (id INTEGER PRIMARY KEY AUTOINCREMENT, value REAL)
    `)
})

app.use(express.json())

//Pra ser bem rápido, não vou criar módulo, repository e outros padrões, será algo simplista e em memória
app.post('/carbon-footprint', (req: Request, res: Response): void => {
    const { value } = req.body

    //O ideal seria fazer um objeto complexo (obsessão primitiva), e a validação seria por sí só
    if (!value) {
        res.status(400).json({ error: "Por favor, digite um VALOR" })

        console.log("VALOR não foi preenchido")

        return
    }

    if (typeof value !== 'number' || value < 1) {
        res.status(400).json({ error: "Valor inválido para quantidade de carbono" })

        console.log("VALOR não é um número, ou é ZERO", value)

        return
    }

    //Arrow function não tem retorno de callback em classe
    db.run("INSERT INTO carbon_footprint (value) VALUES (?)", [value], function(err: Error) {
        if (err) {
            res.status(500).json({ error: "Não foi possível cadastrar o valor da pegada de carbono" })

            console.log("Falha na busca de informações do banco de dados", err)

            return
        }

        const id: number = this.lastID

        //Imaginei usar 204 No Content, mas não quero manipular cabeçalho para retornar ID
        res.status(201).json({ id, value})
    })
})

app.get('/carbon-footprint', (req: Request, res: Response): void => {
    db.all("SELECT id, value FROM carbon_footprint", (err: Error, rows: any[]) => {
        if (err) {
            res.status(500).json({ error: "Não foi possível localizar nenhum registro", trace: err })
        }

        res.status(200).json(rows)
    })
})

export { app }

//Só pra facilitar, quando chamar o módulo direto
if (require.main === module) {
    app.listen(port, () => { console.log("Servidor no ar.")})
}