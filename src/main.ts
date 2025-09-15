import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS para desarrollo
  app.enableCors();

  // Configuración Swagger
  const config = new DocumentBuilder()
    .setTitle('🎮 Gaming Platform API')
    .setDescription(`
      **POC - Plataforma de Distribución Digital de Juegos**
      
      Sistema de microservicios para distribución de juegos digitales optimizado para LATAM.
      
      ### Características:
      - 🔐 Autenticación JWT
      - 🎮 Catálogo de juegos
      - 💳 Pagos multi-moneda
      - 📥 Descargas optimizadas por bloques
      - 🌎 CDN inteligente por región
      
      ### Para Empezar:
      1. Registra un usuario o usa: **gamer@example.com / password123**
      2. Copia el access_token del login
      3. Click en 🔒 **Authorize** y pega: \`Bearer tu_token_aqui\`
    `)
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Ingresa tu JWT token',
      in: 'header',
    })
    .addTag('🔐 Authentication', 'Endpoints de autenticación y manejo de usuarios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: '🎮 Gaming Platform API',
    customCss: `
      .swagger-ui .topbar { background-color: #1f2937; }
      .swagger-ui .scheme-container { background: #f3f4f6; padding: 15px; border-radius: 8px; }
    `,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
🚀 Gaming Platform API ejecutándose en: http://localhost:${port}
📚 Documentación Swagger: http://localhost:${port}/api/docs

👤 Usuario de prueba:
   Email: gamer@example.com
   Password: password123
  `);
}
bootstrap();