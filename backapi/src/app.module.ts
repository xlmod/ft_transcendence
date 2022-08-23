import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AppMiddleware } from './middleware/app.middleware';
import { GameModule } from './game/game.module';

@Module({
	imports: [
		TypeOrmModule.forRoot(),
		ConfigModule.forRoot({ isGlobal: true }),
		UserModule,
		AuthModule,
		GameModule,
	],
	controllers: [AppController],
	providers: [AppService],
	// exports: [UserService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AppMiddleware).forRoutes('*');
	}
}
