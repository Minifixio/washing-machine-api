import { User, UserSchema } from "./User";

export interface Entry {
    user: User;
    filling: number;
}

export const EntrySchema = {
    "type": "object",
    "propreties": {
        "user": {
            UserSchema
        },
        "filling": {
            "type": "integer",
            "minimum": 0,
            "maxium": 100
        }
    }
}