import { cleanEnv, str, port } from "envalid";

export default function validateEnv() {
    cleanEnv(process.env, {
        MONGODB_URL: str(),
        PORT: port(),
        JWT_SECRET: str()
    });
}
