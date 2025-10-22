import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from 'src/users/users.schema';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    async validateUser(email: string, password: string): Promise<UserDocument> {
        const user = await this.usersService.findByEmail(email);

        if (!user) throw new UnauthorizedException('invalid credentials')

        // const isMatch = await bcrypt.compare(password, user.password)
        const isMatch = password === user.password
        if (!isMatch) throw new UnauthorizedException('invalid credentials')

        return user;
    }

    async login(email: string, password: string) {
        const user = await this.validateUser(email, password)

        const payload = { sub: user._id, email: user.email }
        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user: {
                id: user._id,
                name: user?.name,
                email: user?.email,

            }
        }
    }
}
