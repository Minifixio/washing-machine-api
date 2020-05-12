export interface ProgramRequest {
    name: string,
}

export const MachineRequestSchema = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
    },
    "required": [ "name" ]
}