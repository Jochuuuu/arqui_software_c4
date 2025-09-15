import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User, AuthResponse, JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
 
private users: User[] = [
  {
    id: '1',
    name: 'Gaming User',
    email: 'gamer@example.com',
    password: 'password123', // SIN HASH TEMPORAL
    createdAt: new Date(),
  },
  {
    id: '2', 
    name: 'Pro Player',
    email: 'pro@gaming.com',
    password: 'password123', // SIN HASH TEMPORAL
    createdAt: new Date(),
  }
];
  constructor(private jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<any> {
  const user = this.users.find(u => u.email === email);
  
   if (user && user.password === password) {
    const { password: _, ...result } = user;
    return result;
  }
  
  return null;
}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Verificar si el email ya existe
    const existingUser = this.users.find(u => u.email === registerDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Crear nuevo usuario
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const newUser: User = {
      id: (this.users.length + 1).toString(),
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    this.users.push(newUser);

    // Generar token para el nuevo usuario
    const payload: JwtPayload = {
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    };
  }

  async findUserById(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  // Para testing - listar todos los usuarios (sin passwords)
  getAllUsers() {
    return this.users.map(({ password, ...user }) => user);
  }
}