export interface User {
    id: number;
    name: string;
}

export const UserSchema = {
    "type": "object",
    "properties": {
        "id": {
            "type": "integer"
        },
        "name":{
            "type": "string"
        }
    },
    "required": [ "id", "name" ]
}
