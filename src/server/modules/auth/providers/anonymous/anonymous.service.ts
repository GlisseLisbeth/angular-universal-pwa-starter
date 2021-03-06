import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user.entity';
import { SecurityService } from '../../../common/security/security.service';

@Injectable()
export class AnonymousService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly securityService: SecurityService
    ) {}

    async createAnonymousUserAndSession() {
        try {
            const user: User = await this.addAnonymousUserToDatabase();
            const sessionToken = await this.securityService.createSessionToken({
                roles: user.roles,
                id: user.id.toString(),
                loginProvider: 'anonymous',
            });
            const csrfToken = await this.securityService.createCsrfToken();
            const result = { user, sessionToken, csrfToken };
            return result;
        } catch (err) {
            return err;
        }
    }

    private async addAnonymousUserToDatabase(): Promise<User> {
        const user = new User();
        user.isAnonymous = true;
        user.roles = ['anon'];
        return await this.userRepository.save(user);
    }
}
