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

    private static instance: WashingMachine

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

        WashingMachine.instance = this
    }

    public static getInstance(): WashingMachine {
        if (!WashingMachine.instance) {
            console.error('please init your washing machine before any other controller')
            throw Error(Errors.instance_not_initialized)
        }

        return WashingMachine.instance
    }

    public getUsers(): User[] {
        this.removeFinishedMachines()
        return JSON.parse(fs.readFileSync(this.users_path, 'utf8')).users
    }

    public getMachines(): Machine[] {
        this.removeFinishedMachines()
        return JSON.parse(fs.readFileSync(this.machines_path, 'utf8')).machines
    }

    public getPrograms(): Program[] {
        this.removeFinishedMachines()
        return JSON.parse(fs.readFileSync(this.machines_path, 'utf8')).programs
    }

    /**
     * Check if the files are correctly indented
     */
    private initFiles() {

        // Creating the files if they don't exist
        if (!fs.existsSync(`${this.files_path}/users.json`)) {
            try {
                fs.writeFileSync(`${this.files_path}/users.json`, JSON.stringify({ users: [] }))
            } catch(e) {
                throw Error(e)
            }
        }

        // Creating the files if they don't exist
        if (!fs.existsSync(`${this.files_path}/machines.json`)) {
            try {
                fs.writeFileSync(`${this.files_path}/machines.json`, JSON.stringify({ machines: [], programs: [] }))
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
                    machines = incremented
                }

                this.updateMachines(incremented)
                this.removeFinishedMachines()
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

    /**
     * returns an array of machine without the machines already finished
     * @returns {Machine[]} a new array of machine without the old finished machines
     */
    private removeFinishedMachines(): Machine[] {
        let today = Date.now()
        let fileData = JSON.parse(fs.readFileSync(this.machines_path, 'utf8'))
        let newMachines: Machine[] = fileData.machines.slice()

        newMachines.forEach((machine: Machine, index: number) => {
            if (machine.start_date < today) { newMachines.splice(index, 1); console.log('machine n° ' + machine.id + ' is too old, removing it') }
        })

        try {
            if (newMachines.length < fileData.machines.length) {
                fileData.machines = newMachines
                fs.writeFileSync(this.machines_path, JSON.stringify(fileData, null, 4)) 
            }
        } catch(e) {
            throw e
        }
  
        return newMachines
    }

    /**
     * Completly overwrites the machines
     * @param data machines array
     */
    private updateMachines(data: Machine[]) {
        try {
            let fileData = JSON.parse(fs.readFileSync(this.machines_path, 'utf8'))
            fileData.machines = data
            fs.writeFileSync(this.machines_path, JSON.stringify(fileData, null, 4))   
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
            let fileData = JSON.parse(fs.readFileSync(this.machines_path, 'utf8'))
            fileData.programs = data
            fs.writeFileSync(this.machines_path, JSON.stringify(fileData, null, 4))   
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
            let fileData = JSON.parse(fs.readFileSync(this.users_path, 'utf8'))
            fileData.users = data
            fs.writeFileSync(this.users_path, JSON.stringify(fileData, null, 4))   
        } catch(e) {
            throw e
        }
    }

    /**
     * Add a new machine to the machines file
     * @param program_id 
     * @param creator_id 
     * @param start_date must be epoch format
     * @param filling must be in percentage where 0 means the machine is empty and 100 full
     * @param message optional
     */
    public addMachine(program_id: number, creator_id: number, start_date: number, filling = 0, message = ''): boolean {

        let machines = this.getMachines()
        let program = this.getProgramByID(program_id)
        let initDate = Date.now()
        
        if (!program) {
            console.error('wrong program assigned to the machine')
            return false
        }

        if (this.getUserByID(creator_id) == undefined) {
            console.error('wrong creator_id : the user doesn\'t exists')
            return false
        }

        if (start_date < initDate) {
            console.warn('the machine start date is in the past !')
        }

        if (filling > 100) {
            console.error('filling must be in percentage between 0 and 100')
            return false
        }

        let machine: Machine = {
            id: machines.length,
            program,
            creator_id,
            start_date,
            init_date: initDate,
            participating: [],
            filling,
            message
        }

        machines.push(machine)
        this.updateMachines(machines)

        console.log('a new machine was added')
        return true
    }

    /**
     * Add a new user to the users file
     * @param name the name of the user
     */
    public addUser(name: string): number {
        
        let users = this.getUsers()

        let user: User = {
            id: users.length,
            name
        }

        users.push(user)
        this.updateUsers(users)

        console.log('a new user was added')
        return users.length - 1
    }

    /**
     * Add a new program to the machines file
     * @param name the name of the program. The ID is auto incremented
     * @returns {program_id} the id of the program added
     */
    public addProgram(name: string): number {
        let programs = this.getPrograms()

        let program: Program = {
            id: programs.length,
            name
        }

        programs.push(program)
        this.updatePrograms(programs)
        return programs.length - 1
    }

    /**
     * Returns the last machine on the list
     */
    public getCurrentMachine(): Machine | null {
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
    public getProgramByID(id: number): Program | undefined {
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
    public getUserByID(id: number): User | undefined {
        let users = this.getUsers()
        let res = users.find(user => user.id === id)

        if (res) {
            return res
        } else {
            return undefined
        }
    }

    public machineTimeLeft(id: number = 0): number | undefined {
        let machines = this.getMachines()
        let machine = machines[id]

        if (!machine) {
            console.error('no machine with the id', id)
            return undefined
        }

        return machine.start_date - Date.now()
    }

    public entry(user_id: number, filling: number, machine_id: number = 0): boolean {
        let user = this.getUserByID(user_id)
        let machines = this.getMachines()
        let machine =  machines[machine_id]

        if (!user) {
            console.error('the user ' + user_id + ' doesn\'t exist')
            return false
        }

        if (machines.length === 0) {
            console.error('no machine started at the moment')
            return false
        }

        if (!machine) {
            console.error('no machine with the ID', machine_id)
        }

        let exsitingEntryIndex = machine.participating.findIndex(el => el.user)

        if (exsitingEntryIndex != -1) {
            let totalFilling = machine.participating[exsitingEntryIndex].filling + filling;
            totalFilling > 100 ? machine.participating[exsitingEntryIndex].filling = 100: machine.participating[exsitingEntryIndex].filling += filling   
        } else {
            let entry: Entry = { user, filling }
            machine.participating.push(entry)
        }

        this.updateMachines(machines)
        return true
    }

    /**
     * deletes all the machines
     */
    public resetMachines(): void {
        this.updateMachines([])
    }

    /**
     * deletes all the users
     */
    public resetUsers(): void {
        this.updateUsers([])
    }

    /**
     * deletes all the programs
     * warn : you must at least reference one program
     */
    public resetPrograms(): void {
        this.updatePrograms([])
    }
}