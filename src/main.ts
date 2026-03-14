import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as express from 'express';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  let app: NestExpressApplication;
  /* ---------------- SSL SUPPORT ---------------- */
  if (process.env.SSL_ACTIVE === 'true') {
    logger.log('SSL Mode Enabled');
    const httpsOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH as string),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH as string),
    };

    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      httpsOptions,
    });

  } else {
    logger.log('Running in HTTP Mode');
    app = await NestFactory.create<NestExpressApplication>(AppModule);

  }
  const configService = app.get(ConfigService);
  const expressApp = app.getHttpAdapter().getInstance();
  /* ---------------- LANDING PAGE ---------------- */
  expressApp.get('/', (req, res) => {

    const html = `
<!DOCTYPE html>
<html>
<head>

<title>Mini Event Tracker API</title>

<style>

body{
margin:0;
height:100vh;
display:flex;
justify-content:center;
align-items:center;
font-family:Arial;
background:linear-gradient(135deg,#667eea,#764ba2);
color:white;
}

.box{
text-align:center;
background:rgba(0,0,0,0.45);
padding:40px;
border-radius:12px;
}

a{
background:white;
color:black;
padding:12px 20px;
border-radius:6px;
text-decoration:none;
font-weight:bold;
}

</style>

</head>

<body>

<div class="box">

<h1>🚀 Mini Event Tracker API</h1>

<p>NestJS Backend</p>

<a href="/api_documents">View API Docs</a>

</div>

</body>

</html>
`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  });

  /* ---------------- GLOBAL PREFIX ---------------- */

  app.setGlobalPrefix('api/v1');

  /* ---------------- VALIDATION ---------------- */

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  /* ---------------- MIDDLEWARE ---------------- */

  app.enableCors();

  app.use(cookieParser());

  app.use(express.json({ limit: '50mb' }));

  app.use(express.urlencoded({ extended: true }));

  /* ---------------- STATIC FILES ---------------- */

  app.use('/api/v1/uploads', express.static('uploads'));

  /* ---------------- SWAGGER SECURITY ---------------- */

  app.use(
    ['/api_documents'],
    basicAuth({
      challenge: true,
      users: {
        [process.env.SW_USER || 'Admin']:
          process.env.SW_PASSWORD || 'Admin123456',
      },
    }),
  );

  /* ---------------- SWAGGER CONFIG ---------------- */

  const config = new DocumentBuilder()
    .setTitle('Mini Event Tracker API')
    .setDescription('Event Management APIs')
    .setVersion('1.0')
    .addBearerAuth(undefined, 'defaultBearerAuth')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api_documents', app, document, {

    customSiteTitle: 'Mini Event Tracker Docs',

    swaggerOptions: {
      persistAuthorization: true,
    },

  });

  /* ---------------- SERVER START ---------------- */

  const port = Number(configService.get('PORT')) || 5400;

  await app.listen(port).then(() => {

    const dataSource = app.get<DataSource>(DataSource);

    const connectionDetails = {

      Host: dataSource.options['host'],

      Username: dataSource.options['username'],

      Database: dataSource.options['database'],

      DBPort: dataSource.options['port'],

      ServerPort: port,

    };

    console.log('\nConnection Details');
    console.table([connectionDetails]);

  });

}

bootstrap();