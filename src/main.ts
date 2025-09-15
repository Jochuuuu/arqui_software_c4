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
      
      ### 🎯 Flujo Completo Implementado:
      1. **🔐 Autenticación** → Login/Register con JWT
      2. **🎮 Catálogo** → Explorar, buscar y filtrar juegos
      3. **💳 Compras** → Procesar pagos y generar entitlements
      4. **📥 Descargas** → Tokens temporales y descarga por bloques
      
      ### ✨ Características:
      - 🔐 Autenticación JWT (15min)
      - 🎮 Catálogo con filtros avanzados
      - 💳 Pagos multi-moneda (PEN/USD)
      - 📥 Descargas optimizadas por bloques
      - 🌎 CDN inteligente por región
      - 🛡️ Verificación de integridad de archivos
      - 📊 Monitoreo de progreso en tiempo real
      
      ### 🚀 Para Empezar:
      1. **Registra** un usuario o usa: **gamer@example.com / password123**
      2. **Copia** el access_token del login
      3. **Click** en 🔒 **Authorize** y pega: \`Bearer tu_token_aqui\`
      4. **Explora** el catálogo de juegos
      5. **Compra** un juego que no poseas
      6. **Genera** token de descarga
      7. **Simula** descarga por bloques
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
    .addTag('🎮 Games', 'Catálogo de juegos con búsqueda y filtros avanzados')
    .addTag('💰 Purchases', 'Sistema de compras y manejo de entitlements')
    .addTag('📥 Downloads', 'Sistema de descargas por bloques con CDN optimizado')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: '🎮 Gaming Platform API',
    customCss: `
      .swagger-ui .topbar { background-color: #1f2937; }
      .swagger-ui .scheme-container { background: #f3f4f6; padding: 15px; border-radius: 8px; }
      .swagger-ui .opblock.opblock-post { border-color: #10b981; }
      .swagger-ui .opblock.opblock-get { border-color: #3b82f6; }
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

🎯 Flujo completo implementado:
   ✅ Auth Module (Login/Register)
   ✅ Games Module (Catálogo completo)
   ✅ Purchases Module (Compras + Entitlements)
   ✅ Downloads Module (Tokens + Bloques + CDN)
  `);
}
bootstrap();