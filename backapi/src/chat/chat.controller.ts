import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Controller, UseGuards } from '@nestjs/common';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
}
