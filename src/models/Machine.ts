import { Program, ProgramSchema } from "./Program";

export interface Machine {
    id?: number;
    program: Program;
    creator_id: number;
    start_time: number;
    init_time?: number;
    filling: number;
    message?: string;
}

export const MachineSchema = {
    "type": "object",
    "properties": {
        "id": {
            "type": "integer"
        },
        "program":{
            ProgramSchema
        },
        "creator_id": {
            "type": "integer"
        },
        "init_time": {
            "type": "integer"
        },
        "start_time": {
            "type": "integer"
        },
        "filling": {
            "type": "integer"
        },
        "message": {
            "type": "string"
        }
    },
    "required": [ "id", "program", "creator_id", "init_time", "start_time", "filling" ]
}