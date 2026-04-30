import type { CrearArticuloDto } from "src/application/dtos/articulo/CrearArticuloDto";
import type { LoginDto } from "src/application/dtos/auth/LoginDto";
import type { LoginGoogleDto } from "src/application/dtos/auth/LoginGoogleDto";
import type { RefreshAccessTokenDto } from "src/application/dtos/auth/RefreshAccessTokenDto";
import type { ResendSecondFactorDto } from "src/application/dtos/auth/ResendSecondFactorDto";
import type { RegisterUsuarioDto } from "src/application/dtos/auth/RegisterUsuarioDto";
import type { VerifySecondFactorDto } from "src/application/dtos/auth/VerifySecondFactorDto";
import type { CrearCuentaPorPagarDto } from "src/application/dtos/cxp/CrearCuentaPorPagarDto";
import type { RegistrarPagoProveedorDto } from "src/application/dtos/cxp/RegistrarPagoProveedorDto";
import type { ActualizarOrdenCompraDto } from "src/application/dtos/orden-compra/ActualizarOrdenCompraDto";
import type { CrearOrdenCompraDto } from "src/application/dtos/orden-compra/CrearOrdenCompraDto";
import type { RegistrarRecepcionOrdenCompraDto } from "src/application/dtos/orden-compra/RegistrarRecepcionOrdenCompraDto";
import type { CrearProveedorDto } from "src/application/dtos/proveedor/CrearProveedorDto";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import type {
  AuthLoginResponse,
  AuthTokensResponse,
  SecondFactorChallengeResponse,
} from "src/application/use-cases/auth/AuthSessionService";
import type { RegistrarRecepcionOrdenCompraResult } from "src/application/use-cases/orden-compra/RegistrarRecepcionOrdenCompraUseCase";
import type { Articulo } from "src/domain/entities/Articulo";
import type { ArticuloAlmacenStock } from "src/domain/entities/ArticuloAlmacenStock";
import type { AuditoriaEvento } from "src/domain/entities/AuditoriaEvento";
import type {
  Almacen,
  EstadoDocumento,
  GrupoArticulo,
  Impuesto,
  Moneda,
  RolCatalogo,
  TipoDocumento,
} from "src/domain/entities/Catalogos";
import type { CuentaPorPagar } from "src/domain/entities/CuentaPorPagar";
import type { DiarioInventarioMovimiento } from "src/domain/entities/DiarioInventarioMovimiento";
import type { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { PagoProveedor } from "src/domain/entities/PagoProveedor";
import type { Proveedor } from "src/domain/entities/Proveedor";
import type { Usuario } from "src/domain/entities/Usuario";

export interface ExecutableUseCase<TResult, TArgs extends unknown[] = []> {
  execute(...args: TArgs): Promise<TResult>;
}

export interface RefreshableAuthUseCase {
  execute(dto: VerifySecondFactorDto): Promise<AuthTokensResponse>;
  resend(dto: ResendSecondFactorDto): Promise<SecondFactorChallengeResponse>;
  refresh(dto: RefreshAccessTokenDto): Promise<AuthTokensResponse>;
}

export interface ArticuloHttpContext {
  crearArticuloUseCase: ExecutableUseCase<Articulo, [CrearArticuloDto]>;
  listarArticulosUseCase: ExecutableUseCase<Articulo[]>;
  obtenerArticuloUseCase: ExecutableUseCase<Articulo, [string]>;
  actualizarArticuloUseCase: ExecutableUseCase<Articulo, [string, CrearArticuloDto]>;
  eliminarArticuloUseCase: ExecutableUseCase<void, [string]>;
}

export interface ProveedorHttpContext {
  crearProveedorUseCase: ExecutableUseCase<Proveedor, [CrearProveedorDto]>;
  listarProveedoresUseCase: ExecutableUseCase<Proveedor[]>;
  obtenerProveedorUseCase: ExecutableUseCase<Proveedor, [string]>;
  actualizarProveedorUseCase: ExecutableUseCase<Proveedor, [string, CrearProveedorDto]>;
  eliminarProveedorUseCase: ExecutableUseCase<void, [string]>;
}

export interface OrdenCompraHttpContext {
  crearOrdenCompraUseCase: ExecutableUseCase<OrdenCompra, [CrearOrdenCompraDto, string]>;
  listarOrdenesCompraUseCase: ExecutableUseCase<OrdenCompra[]>;
  obtenerOrdenCompraUseCase: ExecutableUseCase<OrdenCompra, [string]>;
  actualizarOrdenCompraUseCase: ExecutableUseCase<OrdenCompra, [string, ActualizarOrdenCompraDto, string]>;
  aprobarOrdenCompraUseCase: ExecutableUseCase<OrdenCompra, [string, string]>;
  registrarRecepcionOrdenCompraUseCase: ExecutableUseCase<
    RegistrarRecepcionOrdenCompraResult,
    [string, RegistrarRecepcionOrdenCompraDto, string]
  >;
  eliminarOrdenCompraUseCase: ExecutableUseCase<void, [string]>;
}

export interface AuthHttpContext {
  listarUsuariosUseCase: ExecutableUseCase<Usuario[]>;
  obtenerUsuarioActualUseCase: ExecutableUseCase<Usuario, [string]>;
  registerUsuarioUseCase: ExecutableUseCase<Usuario, [RegisterUsuarioDto]>;
  loginUsuarioUseCase: ExecutableUseCase<AuthLoginResponse, [LoginDto]>;
  loginGoogleUseCase?: ExecutableUseCase<AuthLoginResponse, [LoginGoogleDto]>;
  verifySegundoFactorUseCase: RefreshableAuthUseCase;
}

export interface CatalogoHttpContext {
  listarRolesUseCase: ExecutableUseCase<RolCatalogo[]>;
  listarMonedasUseCase: ExecutableUseCase<Moneda[]>;
  listarImpuestosUseCase: ExecutableUseCase<Impuesto[]>;
  listarGruposArticuloUseCase: ExecutableUseCase<GrupoArticulo[]>;
  listarAlmacenesUseCase: ExecutableUseCase<Almacen[]>;
  listarEstadosDocumentoUseCase: ExecutableUseCase<EstadoDocumento[]>;
  listarTiposDocumentoUseCase: ExecutableUseCase<TipoDocumento[]>;
}

export interface CuentasPorPagarHttpContext {
  crearCuentaPorPagarUseCase: ExecutableUseCase<CuentaPorPagar, [CrearCuentaPorPagarDto, string]>;
  listarCuentasPorPagarUseCase: ExecutableUseCase<CuentaPorPagar[]>;
  obtenerCuentaPorPagarUseCase: ExecutableUseCase<CuentaPorPagar, [string]>;
  registrarPagoProveedorUseCase: ExecutableUseCase<
    PagoProveedor,
    [string, RegistrarPagoProveedorDto, string]
  >;
  listarPagosProveedorUseCase: ExecutableUseCase<PagoProveedor[]>;
  obtenerPagoProveedorUseCase: ExecutableUseCase<PagoProveedor, [string]>;
}

export interface InventarioHttpContext {
  listarStocksUseCase: ExecutableUseCase<ArticuloAlmacenStock[], [string?]>;
  listarMovimientosInventarioUseCase: ExecutableUseCase<DiarioInventarioMovimiento[]>;
  obtenerMovimientoInventarioUseCase: ExecutableUseCase<DiarioInventarioMovimiento, [string]>;
}

export interface AuditoriaHttpContext {
  listarAuditoriaEventosUseCase: ExecutableUseCase<AuditoriaEvento[]>;
  obtenerAuditoriaEventoUseCase: ExecutableUseCase<AuditoriaEvento, [string]>;
}

export interface HttpDependencies {
  tokenService: ITokenService;
  createArticuloContext(): ArticuloHttpContext;
  createProveedorContext(): ProveedorHttpContext;
  createOrdenCompraContext(): OrdenCompraHttpContext;
  createAuthContext(): AuthHttpContext;
  createCatalogoContext(): CatalogoHttpContext;
  createCuentasPorPagarContext(): CuentasPorPagarHttpContext;
  createInventarioContext(): InventarioHttpContext;
  createAuditoriaContext(): AuditoriaHttpContext;
  isReady?(): Promise<boolean>;
}
