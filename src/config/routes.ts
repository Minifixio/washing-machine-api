import Ajv from 'ajv';

import { Application, Response, Request } from 'express'
import { WashingMachine } from '../WashingMachine'
import { MachineRequest, MachineRequestSchema } from '../models/requests/MachineRequest'
import { ProgramRequest } from '../models/requests/ProgramRequest';
import { ProgramSchema } from '../models/Program';
import { EntryRequest } from '../models/requests/EntryRequest';
import { EntrySchema } from '../models/Entry';
import { UserRequest } from '../models/requests/UserRequest';
var ajv = new Ajv();

export class Routes {

    private Machine: WashingMachine = WashingMachine.getInstance()

    public routes(app: Application, apiUrl: string) {

        //Users entrypoint
        app.route(`/${apiUrl}/user/`)
            /**
             * GET : Returns the list of all the users
             */
            .get((req: Request, res: Response) => {
                res.json(this.Machine.getUsers())
            })

            /**
             * PUT : Add a new user with the name added in the params
             */
            .post((req: Request<{}, {}, UserRequest>, res: Response) => {
                let addedUser = this.Machine.addUser(req.body.name)
                res.json(addedUser)
            })
                    
        //Machines entrypoint
        app.route(`/${apiUrl}/machine`)
            /**
             * GET : Returns the list of all the machines
             */
            .get((req: Request, res: Response) => {
                res.json(this.Machine.getMachines())
            })

            /**
             * POST : Add a new machine respecting the MachineSchema
             */
            .post((req: Request<{}, {}, MachineRequest>, res: Response) => {
                if (!ajv.validate(MachineRequestSchema, req.body)) {
                    res.send('the format of the request is wrong')
                } else {
                    let addedMachine = this.Machine.addMachine(req.body.program_id, req.body.creator_id, req.body.start_date, req.body.filling, req.body.message? req.body.message : '')
                    res.json(addedMachine ? 'machine added successfully': 'error when adding the machine')
                }
            })

        
        //Programs entrypoint
        app.route(`/${apiUrl}/program`)
            /**
             * GET : Return the list of all the programs
             */
            .get((req: Request, res: Response) => {
                res.json(this.Machine.getPrograms())
            })

            /**
             * POST : Add a new program to the program list
             */
            .post((req: Request<{}, {}, ProgramRequest>, res: Response) => {
                if (!ajv.validate(ProgramSchema, req.body)) {
                    res.json('the format of the request is wrong')
                } else {
                    let addedProgram = this.Machine.addProgram(req.body.name)
                    let response = {
                        program: { id: addedProgram, name: req.body.name}
                    }
                    res.json(response)
                }
            })
        
        //Entries entrypoint
        app.route(`/${apiUrl}/entry`)
            /**
             * POST : Add a new entry respecting the EntrySchema
             */
            .post((req: Request<{}, {}, EntryRequest>, res: Response) => {
                if (!ajv.validate(EntrySchema, req.body)) {
                    res.send('the format of the request is wrong')
                } else {
                    let entry = this.Machine.entry(req.body.user_id, req.body.filling)
                    res.json(entry ? 'entry added registered': 'error when registering the entry')
                }
            })
        
        
        //For testing purpose
        app.route('/test')
            .get((req: Request, res: Response) => {
                res.send('api is wroking')
            })

    }
}