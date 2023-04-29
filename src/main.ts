import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { TypeORMSession } from './database/entities/session.entity';
import { TypeormStore } from 'connect-typeorm';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const dataSource = app.get(DataSource);
  const sessionRepository = dataSource.getRepository(TypeORMSession);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        // Max age of the cookie is 60 days
        maxAge: 60000 * 24 * 60,
      },
      store: new TypeormStore().connect(sessionRepository),
    }),
  );

  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
