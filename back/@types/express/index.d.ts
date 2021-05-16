export {}

declare global {
    namespace Express {
        interface Request {
            username: string,
            sub: number
        }
    }
}
