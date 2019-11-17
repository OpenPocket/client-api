import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from '@hapi/joi';
import { Injectable } from '@nestjs/common';

export type EnvConfig = Record<string, string>;

@Injectable()
export class ConfigService {
  private readonly envConfig: Record<string, string>;

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  get(key: string): string {
    return this.envConfig[key];
  }

  getDB(): object {
    const dbConfig: any = {
      type: this.get('DB_TYPE'),
      host: this.get('DB_HOST'),
      port: this.get('DB_PORT'),
      username: this.get('DB_USER'),
      password: this.get('DB_PASS'),
      database: this.get('DB_NAME'),
      entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
      migrations: [`${__dirname}/../**/*.migration{.ts,.js}`],
      synchronize: this.get('DB_SYNC'),
      logging: this.get('DB_LOG'),
    };

    if (this.get('DB_CACHE')) {
      dbConfig.cache = {
        duration: this.get('DB_CACHE_TTL'),
        type: this.get('DB_CACHE_TYPE'),
        options: {
          host: this.get('DB_CACHE_HOST'),
          port: this.get('DB_CACHE_PORT'),
        },
      };
    }

    return dbConfig;
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),
      APP_PORT: Joi.number().default(3000),
      APP_HOST: Joi.string().default('localhost'),
      DB_TYPE: Joi.string().required(),
      DB_HOST: Joi.string().required(),
      DB_PORT: Joi.number().required(),
      DB_USER: Joi.string().required(),
      DB_PASS: Joi.string(),
      DB_NAME: Joi.string().required(),
      DB_SYNC: Joi.boolean().default(false),
      DB_LOG: Joi.boolean().default(false),
      DB_CACHE: Joi.boolean().default(false),
      DB_CACHE_TTL: Joi.number(),
      DB_CACHE_TYPE: Joi.string(),
      DB_CACHE_HOST: Joi.string(),
      DB_CACHE_PORT: Joi.number(),
    })
    .with('DB_CACHE', [
      'DB_CACHE_TTL',
      'DB_CACHE_TYPE',
      'DB_CACHE_HOST',
      'DB_CACHE_PORT',
    ]);

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(
      envConfig,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }
}
