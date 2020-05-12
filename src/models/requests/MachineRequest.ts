export interface MachineRequest {
    program_id: number,
    creator_id: number,
    start_date: number,
    filling: number,
    message?: string
}

export const MachineRequestSchema = {
    "type": "object",
    "properties": {
        "program_id": {
            "type": "integer"
        },
        "creator_id": {
            "type": "integer"
        },
        "start_date": {
            "type": "integer"
        },
        "filling": {
            "type": "integer"
        },
        "message": {
            "type": "string"
        },
    },
    "required": [ "program_id", "creator_id", "start_date", "filling" ]
}