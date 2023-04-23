import "reflect-metadata";
import { DataSource } from "typeorm";
import { ConfigService } from "./services/config.service";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: `postgres://${ConfigService.DBUser}:${ConfigService.DBPass}@${ConfigService.DBHost}/${ConfigService.DBUser}`,
  entities: ["./src/**/*.entity.ts"],
  migrations: ["./src/migrations/*"],
});
