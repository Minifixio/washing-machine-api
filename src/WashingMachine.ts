import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import { User, UserSchema } from "./models/User";
import { Machine, MachineSchema } from './models/Machine';
import { Entry } from './models/Entry';
import { Program, ProgramSchema } from './models/Program';
import { Errors } from './models/Errors';
var ajv = new Ajv();

export class WashingMachine {

    public files_path: string
    private machines_path: string
    private users_path: string 

    constructor (files_path: string = __dirname) {

        if (files_path) {
            files_path = path.resolve(__dirname, files_path)
            if (!fs.existsSync(files_path)) {
                throw Error('please add a correct path') 
            }
        }

        this.files_path = files_path

        this.users_path = `${this.files_path}/users.json`
        this.machines_path = `${this.files_path}/machines.json`

        this.initFiles()
    }

    getUsers(): User[] {
        return JSON.parse(fs.readFileSync(this.users_path, 'utf8')).users
    }

    getMachines(): Machine[] {
        return JSON.parse(fs.readFileSync(this.machines_path, 'utf8')).machines
    }

    getPrograms(): Program[] {
        return JSON.parse(fs.readFileSync(this.machines_path, 'utf8')).programs
    }

    /**
     * Check if the files are correctly indented
     */
    private initFiles() {

        // Creating the files if they don't exist
        if (!fs.existsSync(`${this.files_path}/users.json`)) {
            try {
                fs.writeFileSync(`${this.files_path}/users.json`, JSON.stringify({}))
            } catch(e) {
                throw Error(e)
            }
        }

        // Creating the files if they don't exist
        if (!fs.existsSync(`${this.files_path}/machines.json`)) {
            try {
                fs.writeFileSync(`${this.files_path}/machines.json`, JSON.stringify({}))
            } catch(e) {
                throw Error(e)
            }
        }


        var user_file = JSON.parse(fs.readFileSync(this.users_path, 'utf8'))

        if (!user_file.users || !Array.isArray(user_file.users)) {
            console.error('users are badly indented in the users.json file')
            throw Error(Errors.bad_indetation)
        } else {
            let users: User[] | any = user_file.users

            // If the users file is empty
            if (users.length === 0) {
                console.log('good users file')
            } else {
                // Looking if each item has the correct properties
                users.forEach((user: User | any) => {
                    if (!ajv.validate(UserSchema, user)) {
                        console.error('this user is badly indented', user)
                        throw Error(Errors.bad_indetation)
                    }
                })

                console.log('users are well indented')

                let incremented = this.checkIncrement<User[]>(users)

                if (incremented.length > 0) {
                    this.updateUsers(incremented)
                }
            }
        }


        var machine_file = JSON.parse(fs.readFileSync(this.machines_path, 'utf8'))

        if (!machine_file.machines || !Array.isArray(machine_file.machines)) {
            console.error('machines are badly indented in the machines.json file')
            throw Error(Errors.bad_indetation)
        } else {
            let machines: Machine[] | any = machine_file.machines

            // If the file is empty
            if (machines.length === 0) {
                console.log('machines are well indented')
            } else {
                // Looking if each item has the correct properties
                machines.forEach((machine: Machine | any) => {
                    if (!ajv.validate(MachineSchema, machine)) {
                        console.error('this machine is badly indented', machine)
                        throw Error(Errors.bad_indetation)
                    }
                })

                console.log('machines are well indented')

                let incremented = this.checkIncrement<Machine[]>(machines)

                if (incremented.length > 0) {
                    this.updateMachines(incremented)
                }
            }
        }

        if (!machine_file.programs || !Array.isArray(machine_file.programs)) {
            console.error('programs are badly indented in the machines.json file')
            throw Error(Errors.bad_indetation)
        } else {
            let programs = machine_file.programs

            // At least one program is required
            if (programs.length === 0) {
                console.error('the "programs" are empty in the machine.json file')
                throw Error(Errors.no_programs)
            } else {
                // Looking if each item has the correct properties
                programs.forEach((program: Program | any) => {
                    if (!ajv.validate(ProgramSchema, program)) {
                        console.error('this program is badly indented', program)
                        throw Error(Errors.bad_indetation)
                    }
                })

                console.log('programs are well indented')

                let incremented = this.checkIncrement<Program[]>(programs)

                if (incremented.length > 0) {
                    this.updatePrograms(incremented)
                }
            }
        }
    }

    /**
     * Completly overwrites the machines
     * @param data machines array
     */
    private updateMachines(data: Machine[]) {
        try {
            let file_data = JSON.parse(fs.readFileSync(this.machines_path, 'utf8'))
            file_data.machines = data
            fs.writeFileSync(this.machines_path, JSON.stringify(file_data, null, 4))   
        } catch(e) {
            throw e
        }
    }

    /**
     * Completly overwrites the programs
     * @param data programs array
     */
    private updatePrograms(data: Program[]) {
        try {
            let file_data = JSON.parse(fs.readFileSync(this.machines_path, 'utf8'))
            file_data.programs = data
            fs.writeFileSync(this.machines_path, JSON.stringify(file_data, null, 4))   
        } catch(e) {
            throw e
        }
    }

    /**
     * Completly overwrites the users
     * @param data users array
     */
    private updateUsers(data: User[]) {
        try {
            let file_data = JSON.parse(fs.readFileSync(this.users_path, 'utf8'))
            file_data.users = data
            fs.writeFileSync(this.users_path, JSON.stringify(file_data, null, 4))   
        } catch(e) {
            throw e
        }
    }

    /**
     * Check if the items in the datas files are correctly incremented (ascending order)
     * @param datas an array of Machines or Programs
     */
    private checkIncrement<T extends Machine[] | Program[] | User[]>(datas: T): T | []{

        var changed = false

        for(let i=0; i<datas.length; i++) {
            if (datas[i].id != i) {
                changed = true
                datas[i].id = i
            }
        }

        if (changed) {
            console.log('changed incrementation')
            return datas
        } else {
            return []
        }
    }

    addMachine(program_id: number, creator_id: number, start_time: number, filling = 0, message = '') {

        let machines = this.getMachines()
        let program = this.getProgramByID(program_id)
        
        if (!program) {
            console.error('wrong program assigned to the machine')
            return false
        }

        if (this.getUserByID(creator_id) == undefined) {
            console.error('wrong creator_id : the user doesn\'t exists')
            return false
        }

        let machine: Machine = {
            id: machines.length,
            program,
            creator_id,
            start_time,
            init_time: Date.now(),
            filling,
            message
        }

        machines.push(machine)

        this.updateMachines(machines)

        console.log('a new machine was added')
    }

    /**
     * Add a new user to the users file
     * @param name the name of the user
     */
    addUser(name: string) {
        
        let users = this.getUsers()

        let user: User = {
            id: users.length,
            name
        }

        users.push(user)
        this.updateUsers(users)

        console.log('a new user was added')
    }

    /**
     * Add a new program to the machines file
     * @param name the name of the program. The ID is auto incremented
     */
    addProgram(name: string) {
        let programs = this.getPrograms()

        let program: Program = {
            id: programs.length,
            name
        }

        programs.push(program)
        this.updatePrograms(programs)
    }

    /**
     * Returns the last machine on the list
     */
    getCurrentMachine() {
        let machines = this.getMachines()

        if (machines.length > 0) {
            return machines[0]
        } else {
            return null
        }
    }

    /**
     * Returns the Program with its ID. A program is defined by a name and an ID
     * @param id the id of the program
     * @returns {(Program|undefined)} a program or undefined if no programs were found
     */
    getProgramByID(id: number): Program|undefined {
        let programs = this.getPrograms()

        let res = programs.find(program => program.id === id)

        if (res) {
            return res
        } else {
            return undefined
        }
    }

    /**
     * Get a user with its ID
     * @param id the ID of the user
     * @returns {(User | undefined)} returns undefined if the user doesn't exist
     */
    getUserByID(id: number): User | undefined {
        let users = this.getUsers()

        let res = users.find(user => user.id = id)

        if (res) {
            return res
        } else {
            return undefined
        }
    }
}