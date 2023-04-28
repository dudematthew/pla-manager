import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { UserSerializer } from './auth/user.serializer';
import { UserEntity } from './user/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );

  // const userSerializer: UserSerializer = app.get(UserSerializer);

  // userSerializer.deserializeUser = async (
  //   id: number,
  //   done: (err: Error, payload: string | object) => void,
  // ): Promise<any> => {
  //   const userService = app.get('UserService');
  //   const user: UserEntity = await userService.findById(id);
  //   done(null, user);
  // };

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
