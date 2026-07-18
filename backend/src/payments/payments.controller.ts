import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SaveCardDto } from './dto/save-card.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

@Controller('payments/cards')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  saveCard(
    @Request() req: AuthenticatedRequest,
    @Body() saveCardDto: SaveCardDto,
  ) {
    return this.paymentsService.saveCard(req.user.id, saveCardDto);
  }

  @Get()
  getSavedCards(@Request() req: AuthenticatedRequest) {
    return this.paymentsService.getSavedCards(req.user.id);
  }

  @Delete(':id')
  deleteCard(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.paymentsService.deleteCard(req.user.id, id);
  }
}
