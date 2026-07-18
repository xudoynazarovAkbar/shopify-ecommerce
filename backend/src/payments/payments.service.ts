import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveCardDto } from './dto/save-card.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveCard(buyerId: string, dto: SaveCardDto) {
    // Generate secure simulated token
    const cardToken = `tok_${randomUUID()}`;

    // Extract the last 4 digits
    const last4 = dto.cardNumber.slice(-4);

    return this.prisma.savedCard.create({
      data: {
        buyerId,
        cardToken,
        brand: dto.brand,
        last4,
        expMonth: dto.expMonth,
        expYear: dto.expYear,
      },
    });
  }

  async getSavedCards(buyerId: string) {
    return this.prisma.savedCard.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteCard(buyerId: string, cardId: string) {
    const card = await this.prisma.savedCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new NotFoundException(`Saved card with ID "${cardId}" not found`);
    }

    if (card.buyerId !== buyerId) {
      throw new ForbiddenException(
        'You do not have permission to delete this card',
      );
    }

    return this.prisma.savedCard.delete({
      where: { id: cardId },
    });
  }
}
