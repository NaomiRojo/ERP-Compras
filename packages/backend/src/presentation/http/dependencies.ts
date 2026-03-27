import type { CrearArticuloDto } from "src/application/dtos/articulo/CrearArticuloDto";
import type { LoginDto } from "src/application/dtos/auth/LoginDto";
import type { LoginGoogleDto } from "src/application/dtos/auth/LoginGoogleDto";
import type { RefreshAccessTokenDto } from "src/application/dtos/auth/RefreshAccessTokenDto";
import type { RegisterUsuarioDto } from "src/application/dtos/auth/RegisterUsuarioDto";
import type { VerifySecondFactorDto } from "src/application/dtos/auth/VerifySecondFactorDto";
import type { ActualizarOrdenCompraDto } from "src/application/dtos/orden-compra/ActualizarOrdenCompraDto";
import type { CrearOrdenCompraDto } from "src/application/dtos/orden-compra/CrearOrdenCompraDto";
import type { CrearProveedorDto } from "src/application/dtos/proveedor/CrearProveedorDto";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import type { AuthLoginResponse, AuthTokensResponse } from "src/application/use-cases/auth/AuthSessionService";
import type { Articulo } from "src/domain/entities/Articulo";
import type { OrdenCompra } from "src/domain/entities/OrdenCompra";
import type { Proveedor } from "src/domain/entities/Proveedor";
import type { Usuario } from "src/domain/entities/Usuario";

export interface ExecutableUseCase<TResult, TArgs extends unknown[] = []> {
  execute(...args: TArgs): Promise<TResult>;
}

export interface RefreshableAuthUseCase {
  execute(dto: VerifySecondFactorDto): Promise<AuthTokensResponse>;
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

export interface HttpDependencies {
  tokenService: ITokenService;
  createArticuloContext(): ArticuloHttpContext;
  createProveedorContext(): ProveedorHttpContext;
  createOrdenCompraContext(): OrdenCompraHttpContext;
  createAuthContext(): AuthHttpContext;
}
