export interface EntryRequest {
    user_id: number;
    machine_id?: number;
    filling: number;
}

export const EntryRequestSchema = {
    "type": "object",
    "properties": {
        "user_id": {
            "type": "integer"
        },
        "machine_id": {
            "type": "integer"
        },
        "filling": {
            "type": "integer"
        }
    },
    "required": [ "user_id", "filling" ]
}