import type { DataSource } from "typeorm";
import type { IAuditService } from "src/application/interfaces/IAuditService";
import type { IEmailService } from "src/application/interfaces/IEmailService";
import type { IGoogleIdentityService } from "src/application/interfaces/IGoogleIdentityService";
import type { ILogger } from "src/application/interfaces/ILogger";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import { AuthSessionService } from "src/application/use-cases/auth/AuthSessionService";
import { ListarUsuariosUseCase } from "src/application/use-cases/auth/ListarUsuariosUseCase";
import { LoginGoogleUseCase } from "src/application/use-cases/auth/LoginGoogleUseCase";
import { LoginUsuarioUseCase } from "src/application/use-cases/auth/LoginUsuarioUseCase";
import { ObtenerUsuarioActualUseCase } from "src/application/use-cases/auth/ObtenerUsuarioActualUseCase";
import { RegisterUsuarioUseCase } from "src/application/use-cases/auth/RegisterUsuarioUseCase";
import { VerifySegundoFactorUseCase } from "src/application/use-cases/auth/VerifySegundoFactorUseCase";
import { ActualizarArticuloUseCase } from "src/application/use-cases/articulo/ActualizarArticuloUseCase";
import { CrearArticuloUseCase } from "src/application/use-cases/articulo/CrearArticuloUseCase";
import { EliminarArticuloUseCase } from "src/application/use-cases/articulo/EliminarArticuloUseCase";
import { ListarArticulosUseCase } from "src/application/use-cases/articulo/ListarArticulosUseCase";
import { ObtenerArticuloUseCase } from "src/application/use-cases/articulo/ObtenerArticuloUseCase";
import { GoogleIdentityService } from "src/infrastructure/auth/GoogleIdentityService";
import { ActualizarProveedorUseCase } from "src/application/use-cases/proveedor/ActualizarProveedorUseCase";
import { CrearProveedorUseCase } from "src/application/use-cases/proveedor/CrearProveedorUseCase";
import { EliminarProveedorUseCase } from "src/application/use-cases/proveedor/EliminarProveedorUseCase";
import { ListarProveedoresUseCase } from "src/application/use-cases/proveedor/ListarProveedoresUseCase";
import { ObtenerProveedorUseCase } from "src/application/use-cases/proveedor/ObtenerProveedorUseCase";
import { ActualizarOrdenCompraUseCase } from "src/application/use-cases/orden-compra/ActualizarOrdenCompraUseCase";
import { CrearOrdenCompraUseCase } from "src/application/use-cases/orden-compra/CrearOrdenCompraUseCase";
import { EliminarOrdenCompraUseCase } from "src/application/use-cases/orden-compra/EliminarOrdenCompraUseCase";
import { ListarOrdenesCompraUseCase } from "src/application/use-cases/orden-compra/ListarOrdenesCompraUseCase";
import { ObtenerOrdenCompraUseCase } from "src/application/use-cases/orden-compra/ObtenerOrdenCompraUseCase";
import { JwtService } from "src/infrastructure/auth/JwtService";
import { PasswordService } from "src/infrastructure/auth/PasswordService";
import { SmtpEmailService } from "src/infrastructure/email/SmtpEmailService";
import { Logger } from "src/infrastructure/logging/Logger";
import { createAppDataSource } from "src/infrastructure/persistence/postgres/orm/data-source";
import { ArticuloRepository } from "src/infrastructure/persistence/postgres/repositories/ArticuloRepository";
import { CodigoSegundoFactorRepository } from "src/infrastructure/persistence/postgres/repositories/CodigoSegundoFactorRepository";
import { ImpuestoRepository } from "src/infrastructure/persistence/postgres/repositories/ImpuestoRepository";
import { OrdenCompraRepository } from "src/infrastructure/persistence/postgres/repositories/OrdenCompraRepository";
import { ProveedorRepository } from "src/infrastructure/persistence/postgres/repositories/ProveedorRepository";
import { RefreshTokenSesionRepository } from "src/infrastructure/persistence/postgres/repositories/RefreshTokenSesionRepository";
import { UsuarioRepository } from "src/infrastructure/persistence/postgres/repositories/UsuarioRepository";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";
import type { HttpDependencies } from "src/presentation/http/dependencies";

export interface AppContainer extends HttpDependencies {
  logger: ILogger;
  passwordService: IPasswordService;
  tokenService: ITokenService;
  emailService?: IEmailService;
  googleIdentityService?: IGoogleIdentityService;
  auditService?: IAuditService;
}

export interface ContainerOptions {
  dataSource?: DataSource;
  logger?: ILogger;
  passwordService?: IPasswordService;
  tokenService?: ITokenService;
  emailService?: IEmailService;
  googleIdentityService?: IGoogleIdentityService;
  auditService?: IAuditService;
}

const createGoogleIdentityService = (): IGoogleIdentityService | undefined => {
  const audiences = (Bun.env.GOOGLE_CLIENT_ID ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return audiences.length > 0 ? new GoogleIdentityService(audiences) : undefined;
};

const createEmailService = (): IEmailService | undefined => {
  const smtpHost = Bun.env.SMTP_HOST?.trim();
  const smtpPort = Number(Bun.env.SMTP_PORT ?? 587);
  const smtpSecure = (Bun.env.SMTP_SECURE ?? "false") === "true";
  const smtpUser = Bun.env.SMTP_USER?.trim();
  const smtpPass = Bun.env.SMTP_PASS?.trim();
  const smtpFrom = Bun.env.SMTP_FROM?.trim() || smtpUser;

  return smtpHost && smtpUser && smtpPass && smtpFrom
    ? new SmtpEmailService({
        host: smtpHost,
        port: Number.isFinite(smtpPort) ? smtpPort : 587,
        secure: smtpSecure,
        user: smtpUser,
        pass: smtpPass,
        from: smtpFrom,
      })
    : undefined;
};

export const createContainer = (options: ContainerOptions = {}): AppContainer => {
  const dataSource = options.dataSource ?? createAppDataSource();
  const logger = options.logger ?? new Logger();
  const passwordService = options.passwordService ?? new PasswordService();
  const tokenService =
    options.tokenService ?? new JwtService(Bun.env.JWT_SECRET ?? "dev-secret-change-me", 60 * 60);
  const emailService = options.emailService ?? createEmailService();
  const googleIdentityService = options.googleIdentityService ?? createGoogleIdentityService();
  const auditService = options.auditService;
  const twoFactorEmailOverride = Bun.env.TWO_FACTOR_EMAIL_OVERRIDE?.trim() || undefined;

  return {
    logger,
    passwordService,
    tokenService,
    emailService,
    googleIdentityService,
    auditService,
    createArticuloContext() {
      const unitOfWork = new TypeOrmUnitOfWork(dataSource);
      const articuloRepository = new ArticuloRepository(unitOfWork);

      return {
        crearArticuloUseCase: new CrearArticuloUseCase(articuloRepository, unitOfWork),
        listarArticulosUseCase: new ListarArticulosUseCase(articuloRepository),
        obtenerArticuloUseCase: new ObtenerArticuloUseCase(articuloRepository),
        actualizarArticuloUseCase: new ActualizarArticuloUseCase(articuloRepository, unitOfWork),
        eliminarArticuloUseCase: new EliminarArticuloUseCase(articuloRepository),
      };
    },
    createProveedorContext() {
      const unitOfWork = new TypeOrmUnitOfWork(dataSource);
      const proveedorRepository = new ProveedorRepository(unitOfWork);

      return {
        crearProveedorUseCase: new CrearProveedorUseCase(proveedorRepository, unitOfWork),
        listarProveedoresUseCase: new ListarProveedoresUseCase(proveedorRepository),
        obtenerProveedorUseCase: new ObtenerProveedorUseCase(proveedorRepository),
        actualizarProveedorUseCase: new ActualizarProveedorUseCase(proveedorRepository, unitOfWork),
        eliminarProveedorUseCase: new EliminarProveedorUseCase(proveedorRepository),
      };
    },
    createOrdenCompraContext() {
      const unitOfWork = new TypeOrmUnitOfWork(dataSource);
      const ordenCompraRepository = new OrdenCompraRepository(unitOfWork);
      const impuestoRepository = new ImpuestoRepository(unitOfWork);

      return {
        crearOrdenCompraUseCase: new CrearOrdenCompraUseCase(
          ordenCompraRepository,
          impuestoRepository,
          unitOfWork,
        ),
        listarOrdenesCompraUseCase: new ListarOrdenesCompraUseCase(ordenCompraRepository),
        obtenerOrdenCompraUseCase: new ObtenerOrdenCompraUseCase(ordenCompraRepository),
        actualizarOrdenCompraUseCase: new ActualizarOrdenCompraUseCase(
          ordenCompraRepository,
          impuestoRepository,
          unitOfWork,
        ),
        eliminarOrdenCompraUseCase: new EliminarOrdenCompraUseCase(ordenCompraRepository),
      };
    },
    createAuthContext() {
      const unitOfWork = new TypeOrmUnitOfWork(dataSource);
      const usuarioRepository = new UsuarioRepository(unitOfWork);
      const codigoSegundoFactorRepository = new CodigoSegundoFactorRepository(unitOfWork);
      const refreshTokenSesionRepository = new RefreshTokenSesionRepository(unitOfWork);
      const authSessionService = new AuthSessionService(
        codigoSegundoFactorRepository,
        refreshTokenSesionRepository,
        passwordService,
        tokenService,
        (Bun.env.EXPOSE_2FA_CODE ?? "true") === "true",
        emailService,
        twoFactorEmailOverride,
      );

      return {
        listarUsuariosUseCase: new ListarUsuariosUseCase(usuarioRepository),
        obtenerUsuarioActualUseCase: new ObtenerUsuarioActualUseCase(usuarioRepository),
        registerUsuarioUseCase: new RegisterUsuarioUseCase(
          usuarioRepository,
          passwordService,
          unitOfWork,
        ),
        loginUsuarioUseCase: new LoginUsuarioUseCase(
          usuarioRepository,
          passwordService,
          authSessionService,
        ),
        loginGoogleUseCase: googleIdentityService
          ? new LoginGoogleUseCase(
              usuarioRepository,
              googleIdentityService,
              passwordService,
              authSessionService,
              unitOfWork,
            )
          : undefined,
        verifySegundoFactorUseCase: new VerifySegundoFactorUseCase(
          codigoSegundoFactorRepository,
          usuarioRepository,
          passwordService,
          authSessionService,
        ),
      };
    },
  };
};
