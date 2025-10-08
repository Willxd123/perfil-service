import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DocenteModule } from './docente/docente.module';
import { EstudianteModule } from './estudiante/estudiante.module';
import { GrupoEstudianteModule } from './grupo-estudiante/grupo-estudiante.module';

@Module({
  imports: [
    // Configuración global de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM con PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),

        // Configuración SSL para Render
        ssl:
          configService.get('DATABASE_SSL') === 'true'
            ? {
                rejectUnauthorized: false,
              }
            : false,

        // Auto-descubrimiento de entidades
        autoLoadEntities: true,

        // ⚠️ IMPORTANTE: false porque no queremos que NestJS modifique la BD compartida
        synchronize: false,

        // Ver queries en desarrollo
        logging: false,
      }),
      inject: [ConfigService],
    }),
    DocenteModule,
    GrupoEstudianteModule,
    EstudianteModule

  ],
})
export class AppModule { }
