import { DataSource, EntityManager, Repository } from 'typeorm';
import { Comanda } from '../database/entity/Comanda';
import { Order } from '../database/entity/Order';
import { OrderStatus, ComandaStatus } from '../enum';
import { AppError } from '../middleware/error/AppError';
import { PaymentService } from './PaymentService';
import { ReceiptService } from './ReceiptService';
import { CreateComandaDTO } from '../dto/comanda/CreateComandaDTO';
import { CancelComandaDTO } from '../dto/comanda/CancelComandaDTO';

export class ComandaService {
  constructor(
    private dataSource: DataSource,
    private comandaRepository: Repository<Comanda>,
    private paymentService: PaymentService,
    private receiptService: ReceiptService,
  ) {}

  async getComanda(comandaId: number): Promise<Comanda | null> {
    return await this.comandaRepository.findOne({
      where: { id: comandaId },
    });
  }

  async createComanda(comandaData: CreateComandaDTO): Promise<Comanda> {
    const novaComanda = this.comandaRepository.create({
      ...comandaData,
      status: ComandaStatus.ABERTA,
      total: 0,
    } as Partial<Comanda>);

    return await this.comandaRepository.save(novaComanda);
  }

  async listComandas(establishmentId: number): Promise<Comanda[]> {
    return await this.dataSource.getRepository(Comanda)
      .createQueryBuilder('comanda')
      .leftJoinAndSelect('comanda.pedidos', 'pedido')
      .leftJoinAndSelect('pedido.productOrders', 'po')
      .leftJoinAndSelect('po.product', 'product')
      .leftJoinAndSelect('po.productVariation', 'pv')
      .where('comanda.establishment = :id', { id: establishmentId })
      .getMany();
  }

  async listComandasByStatus(status: ComandaStatus, establishmentId: number): Promise<Comanda[]> {
    return await this.dataSource.getRepository(Comanda)
      .createQueryBuilder('comanda')
      .leftJoinAndSelect('comanda.pedidos', 'pedido')
      .leftJoinAndSelect('pedido.productOrders', 'po')
      .leftJoinAndSelect('po.product', 'product')
      .leftJoinAndSelect('po.productVariation', 'pv')
      .where('comanda.status = :status', { status })
      .andWhere('comanda.establishment = :id', { id: establishmentId })
      .getMany();
  }

  async listComandasHistory(establishmentId: number): Promise<Comanda[]> {
    return await this.dataSource.getRepository(Comanda)
      .createQueryBuilder('comanda')
      .leftJoinAndSelect('comanda.pedidos', 'pedido')
      .leftJoinAndSelect('pedido.productOrders', 'po')
      .leftJoinAndSelect('po.product', 'product')
      .leftJoinAndSelect('po.productVariation', 'pv')
      .where('comanda.status IN (:...statuses)', { statuses: [ComandaStatus.FECHADA, ComandaStatus.CANCELADA] })
      .andWhere('comanda.establishment = :id', { id: establishmentId })
      .orderBy('comanda.created_at', 'DESC')
      .getMany();
  }

  async updateComandaStatus(
    comandaId: number,
    status: ComandaStatus,
  ): Promise<void> {
    const comanda = await this.comandaRepository.findOne({
      where: { id: comandaId },
    });
    if (!comanda) throw new AppError('Comanda não encontrada', 404);

    comanda.status = status;
    await this.comandaRepository.save(comanda);
  }

  async cancelComanda(data: CancelComandaDTO): Promise<void> {
    const comanda = await this.comandaRepository.findOne({
      where: { id: data.comandaId },
      relations: ['pedidos']
    });
    if (!comanda) throw new AppError('Comanda não encontrada', 404);

    comanda.status = ComandaStatus.CANCELADA;
    await this.comandaRepository.save(comanda);

    if (comanda.pedidos && comanda.pedidos.length > 0) {
        for (const pedido of comanda.pedidos) {
            if (pedido.status !== OrderStatus.FINALIZADO && pedido.status !== OrderStatus.CANCELADO) {
                pedido.status = OrderStatus.CANCELADO;
                pedido.cancellationDescription = (data as any).reason || 'Comanda inteira cancelada na Cozinha';
                await this.dataSource.getRepository(Order).save(pedido);
            }
        }
    }
  }

  async updateComandaTotalTransaction(
    comanda: Comanda,
    valorAdicional: number,
    manager: EntityManager,
  ): Promise<void> {
    comanda.total = Number(comanda.total) + Number(valorAdicional);
    await manager.save(Comanda, comanda);
  }

  async checkoutComanda(
    comandaId: number,
    userId: number,
    establishmentId: number,
    checkoutData: any,
  ) {
    let firstPaymentId: number | null = null;

    const result = await this.dataSource.transaction(async (manager) => {
      const comanda = await manager.findOne(Comanda, {
        where: { id: comandaId, establishment: { id: establishmentId } },
        relations: ['pedidos'],
      });

      if (!comanda) throw new AppError('Comanda não encontrada.', 404);
      if (comanda.status === ComandaStatus.FECHADA)
        throw new AppError('Esta comanda já está fechada.', 400);

      const pedidos = comanda.pedidos || [];
      const validOrders = pedidos.filter(
        (p) => p.status !== OrderStatus.CANCELADO,
      );

      comanda.discountType = checkoutData.discountType || null;
      comanda.discountValue = checkoutData.discountValue || 0;
      comanda.total = checkoutData.totalValue;
      comanda.status = ComandaStatus.FECHADA;

      await manager.save(Comanda, comanda);

      const paymentsArray = Array.isArray(checkoutData.payments)
        ? checkoutData.payments
        : [{ type: checkoutData.paymentType, amount: checkoutData.totalValue }];

      const registeredPayments =
        await this.paymentService.processCheckoutPayments(
          comandaId,
          validOrders,
          paymentsArray,
          checkoutData.change || 0,
          establishmentId,
          userId,
          manager,
        );

      if (registeredPayments.length > 0) {
        firstPaymentId = registeredPayments[0].id;
      }

      return {
        success: true,
        message: 'Comanda finalizada com sucesso.',
        comanda,
        payments: registeredPayments,
      };
    });

    if (firstPaymentId) {
      try {
        await this.receiptService.generateReceipt(
          firstPaymentId,
          establishmentId,
          checkoutData.cpfcnpj || null,
        );
      } catch (error: any) {
        console.error(
          '⚠️ [ComandaService] Erro ao gerar Nota Fiscal:',
          error.message,
        );
      }
    }

    return result;
  }
}