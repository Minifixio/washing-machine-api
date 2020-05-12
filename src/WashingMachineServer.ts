import express from 'express'
import cors from 'express'
import * as bodyParser from "body-parser";
import { Routes } from './config/routes';

export class WashingMachineServer {

    readonly port: number
    readonly apiUrl: string

    private app: express.Application
    private Routes: Routes = new Routes()

    constructor(port: number, api_url: string) {
        this.port = port
        this.apiUrl = api_url
        this.app = express()
        this.config()
        this.Routes.routes(this.app, this.apiUrl)

        this.app.listen(this.port, (req, res) => {
            console.log('the app is listening on port', this.port)
        })

    }

    private config() {
        this.app.use(bodyParser.json())
        //this.app.use(cors())
    }
}
