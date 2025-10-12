import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'abc123bvk789',  // Replace with your actual JWT secret
        });
    }

    async validate(payload: any) {
        // This method is called once the token is verified
        // The returned object is attached to req.user
        return { _id: payload.sub, username: payload.username };
    }
}
