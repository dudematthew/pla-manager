import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypeORMSession } from './database/entities/session.entity';
import { TypeormStore } from 'connect-typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as passport from 'passport';
import * as session from 'express-session';
import 'dotenv/config';

import { createAgent } from '@forestadmin/agent';
import { createSqlDataSource } from '@forestadmin/datasource-sql';

const dbC = {
  protocol: 'mysql',
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
};

const connectionString = `${dbC.protocol}://${dbC.username}:${dbC.password}@${dbC.host}:${dbC.port}/${dbC.database}`;

// console.log(dbC);
// console.log(connectionString);


async function bootstrap() {

  // const forestAdminAgent = createAgent({
  //   authSecret: process.env.FOREST_AUTH_SECRET,
  //   envSecret: process.env.FOREST_ENV_SECRET,
  //   isProduction: process.env.NODE_ENV === 'production',
  //   typingsPath: './typings.ts',
  //   typingsMaxDepth: 5,
  // });
  
  // Create your SQL datasource
  // forestAdminAgent.addDataSource(createSqlDataSource(connectionString));

  const app = await NestFactory.create(AppModule);

  const sessionRepository = app.get(getRepositoryToken(TypeORMSession));

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

  // Initialize Passport and restore authentication state
  app.use(passport.initialize());
  app.use(passport.session());
0
  // Start the Forest Admin server
  // await forestAdminAgent.mountOnNestJs(app).start();

  await app.listen(3000);
}
bootstrap();
