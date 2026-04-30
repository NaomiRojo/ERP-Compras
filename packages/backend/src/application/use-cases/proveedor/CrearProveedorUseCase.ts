import type { CrearProveedorDto } from "src/application/dtos/proveedor/CrearProveedorDto";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { Proveedor } from "src/domain/entities/Proveedor";
import type { IProveedorRepository } from "src/domain/repositories/IProveedorRepository";

export class CrearProveedorUseCase {
  public constructor(
    private readonly proveedorRepository: IProveedorRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(dto: CrearProveedorDto): Promise<Proveedor> {
    const cardCode = dto.cardCode.trim();
    const cardName = dto.cardName.trim();
    const nitRut = dto.nitRut.trim();

    if (!cardCode || !cardName || !nitRut) {
      throw new Error("cardCode, cardName y nitRut son obligatorios");
    }

    await this.unitOfWork.start();

    try {
      const existingByCode = await this.proveedorRepository.findByCardCode(cardCode);
      if (existingByCode) {
        throw new Error("Ya existe un proveedor con ese cardCode");
      }

      const existingByNit = await this.proveedorRepository.findByNitRut(nitRut);
      if (existingByNit) {
        throw new Error("Ya existe un proveedor con ese nitRut");
      }

      const proveedor = new Proveedor({
        id: crypto.randomUUID(),
        cardCode,
        cardName,
        nombreComercial: dto.nombreComercial?.trim() || undefined,
        nitRut,
        email: dto.email?.trim() || undefined,
        telefono: dto.telefono?.trim() || undefined,
        direccion: dto.direccion?.trim() || undefined,
        monedaId: dto.monedaId,
        balanceCuenta: 0,
        lineaCredito: dto.lineaCredito ?? 0,
        activo: true,
      });

      await this.proveedorRepository.save(proveedor);
      await this.unitOfWork.commit();

      return proveedor;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    } finally {
      await this.unitOfWork.release();
    }
  }
}
