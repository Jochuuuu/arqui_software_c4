import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt.guard';

@ApiTags('🔐 Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar Sesión',
    description: 'Autentica un usuario y devuelve JWT token para acceder al sistema'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '1',
          email: 'gamer@example.com',
          name: 'Gaming User'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas'
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Registrar Usuario',
    description: 'Crea una nueva cuenta de usuario en la plataforma'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '3',
          email: 'newgamer@example.com',
          name: 'John Gamer'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El email ya está registrado'
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Perfil de Usuario',
    description: 'Obtiene la información del usuario autenticado'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil obtenido exitosamente',
    schema: {
      example: {
        id: '1',
        email: 'gamer@example.com',
        name: 'Gaming User'
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token JWT inválido o faltante'
  })
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cerrar Sesión',
    description: 'Invalida la sesión actual (en una implementación real invalidaría el token)'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout exitoso',
    schema: {
      example: {
        message: 'Logout exitoso',
        timestamp: '2025-09-14T15:30:00Z'
      }
    }
  })
  async logout(@Request() req) {
    // En un sistema real, aquí invalidarías el token en una blacklist
    return {
      message: 'Logout exitoso',
      user: req.user.email,
      timestamp: new Date().toISOString(),
    };
  }

  // ENDPOINT EXTRA PARA TESTING
  @Get('users')
  @ApiOperation({
    summary: '👥 Listar Usuarios (Testing)',
    description: 'Lista todos los usuarios registrados - Solo para POC'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de usuarios sin passwords'
  })
  getAllUsers() {
    return {
      users: this.authService.getAllUsers(),
      total: this.authService.getAllUsers().length,
    };
  }
}