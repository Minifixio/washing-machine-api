export interface Program {
    id: number;
    name: string;
}

export const ProgramSchema = {
    "type": "object",
    "properties": {
        "id": {
            "type": "integer"
        },
        "name": {
            "type": "string"
        }
    }
}
