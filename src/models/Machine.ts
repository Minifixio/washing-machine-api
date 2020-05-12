import { Program, ProgramSchema } from "./Program";
import { Entry, EntrySchema } from "./Entry";

export interface Machine {
    id: number;
    program: Program;
    creator_id: number;
    start_date: number;
    init_date: number;
    participating: Entry[];
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
        "init_date": {
            "type": "integer"
        },
        "start_date": {
            "type": "integer"
        },
        "participating": {
            "type": "array",
            "items": {
                EntrySchema
            }
        },
        "filling": {
            "type": "integer",
            "minimum": 0,
            "maxium": 100
        },
        "message": {
            "type": "string"
        }
    },
    "required": [ "id", "program", "creator_id", "init_date", "start_date", "filling" ]
}
