export interface UserRequest {
    name: string;
}

export const UserRequestSchema = {
    "type": "object",
    "properties": {
        "name": {
            "type": "integer"
        }
    },
    "required": [ "name" ]
}