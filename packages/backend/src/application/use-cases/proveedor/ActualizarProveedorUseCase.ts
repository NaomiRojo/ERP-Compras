import type { CrearProveedorDto } from "src/application/dtos/proveedor/CrearProveedorDto";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { Proveedor } from "src/domain/entities/Proveedor";
import type { IProveedorRepository } from "src/domain/repositories/IProveedorRepository";

export class ActualizarProveedorUseCase {
  public constructor(
    private readonly proveedorRepository: IProveedorRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  public async execute(id: string, dto: CrearProveedorDto): Promise<Proveedor> {
    const actual = await this.proveedorRepository.findById(id);
    if (!actual) {
      throw new Error("Proveedor no encontrado");
    }

    await this.unitOfWork.start();

    try {
      const proveedor = new Proveedor({
        id,
        cardCode: dto.cardCode.trim(),
        cardName: dto.cardName.trim(),
        nombreComercial: dto.nombreComercial?.trim() || undefined,
        nitRut: dto.nitRut.trim(),
        email: dto.email?.trim() || undefined,
        telefono: dto.telefono?.trim() || undefined,
        direccion: dto.direccion?.trim() || undefined,
        monedaId: dto.monedaId,
        balanceCuenta: actual.props.balanceCuenta,
        lineaCredito: dto.lineaCredito ?? actual.props.lineaCredito,
        activo: actual.props.activo,
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
