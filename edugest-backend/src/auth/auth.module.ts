// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '1d';
        
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            // El "as any" o "as const" soluciona la restricción estricta de StringValue
            expiresIn: expiresIn as any, 
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Asegúrate de incluir JwtStrategy aquí
  exports: [AuthService],
})
export class AuthModule {}