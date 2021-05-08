import {TypeOrmModuleOptions} from "@nestjs/typeorm";

const config: TypeOrmModuleOptions = {
    type: "postgres",
    host: "db",
    username: "postgres",
    password: "password",
    database: "ft_transcendence",
    port: 5432,
    synchronize: true,
    entities: ["dist/src/**/*.entity.js"],
    migrations: ["dist/src/db/migrations/*.js"],
    migrationsRun: false,
    cli: {
        migrationsDir: "src/db/migrations",
        entitiesDir: "src/db/entities"
    }
}

export default config
