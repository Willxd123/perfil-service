import { EstudianteService } from './../estudiante/estudiante.service';
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LogingDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: EstudianteService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ registro, codigo }: LogingDto) {
    const estudiante = await this.usuariosService.findByRegistroWithPassword(registro);
  
    if (!estudiante) {
      throw new UnauthorizedException('Registro incorrecto');
    }
  
    if (!estudiante.codigo) {
      throw new UnauthorizedException('Estudiante sin codigo configurada');
    }
  
    let passwordOk = false;
  
    // Verificar si la codigo está encriptada (hash de bcrypt empieza con $2a$, $2b$ o $2y$)
    if (estudiante.codigo.startsWith('$2')) {
      // codigo encriptada - usar bcrypt
      passwordOk = await bcrypt.compare(codigo, estudiante.codigo);
    } else {
      // codigo en texto plano - comparación directa
      passwordOk = codigo === estudiante.codigo;
    }
  
    if (!passwordOk) {
      throw new UnauthorizedException('codigo incorrecta');
    }
  
    const payload = {
      id: estudiante.id,
      registro: estudiante.registro,
      nombre: estudiante.nombre,
    };
  
    const token = await this.jwtService.signAsync(payload);
    return { token, registro: estudiante.registro };
  }

}
