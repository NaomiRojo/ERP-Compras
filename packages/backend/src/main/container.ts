import type { IAuditService } from "src/application/interfaces/IAuditService";
import type { IEmailService } from "src/application/interfaces/IEmailService";
import type { IGoogleIdentityService } from "src/application/interfaces/IGoogleIdentityService";
import type { ILogger } from "src/application/interfaces/ILogger";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import type { IUnitOfWork } from "src/application/interfaces/IUnitOfWork";
import { AuthSessionService } from "src/application/use-cases/auth/AuthSessionService";
import { ListarUsuariosUseCase } from "src/application/use-cases/auth/ListarUsuariosUseCase";
import { LoginGoogleUseCase } from "src/application/use-cases/auth/LoginGoogleUseCase";
import { LoginUsuarioUseCase } from "src/application/use-cases/auth/LoginUsuarioUseCase";
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
import { AppDataSource } from "src/infrastructure/persistence/postgres/orm/data-source";
import { ArticuloRepository } from "src/infrastructure/persistence/postgres/repositories/ArticuloRepository";
import { CodigoSegundoFactorRepository } from "src/infrastructure/persistence/postgres/repositories/CodigoSegundoFactorRepository";
import { OrdenCompraRepository } from "src/infrastructure/persistence/postgres/repositories/OrdenCompraRepository";
import { ProveedorRepository } from "src/infrastructure/persistence/postgres/repositories/ProveedorRepository";
import { RefreshTokenSesionRepository } from "src/infrastructure/persistence/postgres/repositories/RefreshTokenSesionRepository";
import { UsuarioRepository } from "src/infrastructure/persistence/postgres/repositories/UsuarioRepository";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";

export interface AppContainer {
  logger: ILogger;
  passwordService: IPasswordService;
  tokenService: ITokenService;
  emailService?: IEmailService;
  googleIdentityService?: IGoogleIdentityService;
  auditService?: IAuditService;
  createArticuloContext(): {
    unitOfWork: IUnitOfWork;
    articuloRepository: ArticuloRepository;
    crearArticuloUseCase: CrearArticuloUseCase;
    listarArticulosUseCase: ListarArticulosUseCase;
    obtenerArticuloUseCase: ObtenerArticuloUseCase;
    actualizarArticuloUseCase: ActualizarArticuloUseCase;
    eliminarArticuloUseCase: EliminarArticuloUseCase;
  };
  createProveedorContext(): {
    unitOfWork: IUnitOfWork;
    proveedorRepository: ProveedorRepository;
    crearProveedorUseCase: CrearProveedorUseCase;
    listarProveedoresUseCase: ListarProveedoresUseCase;
    obtenerProveedorUseCase: ObtenerProveedorUseCase;
    actualizarProveedorUseCase: ActualizarProveedorUseCase;
    eliminarProveedorUseCase: EliminarProveedorUseCase;
  };
  createOrdenCompraContext(): {
    unitOfWork: IUnitOfWork;
    ordenCompraRepository: OrdenCompraRepository;
    crearOrdenCompraUseCase: CrearOrdenCompraUseCase;
    listarOrdenesCompraUseCase: ListarOrdenesCompraUseCase;
    obtenerOrdenCompraUseCase: ObtenerOrdenCompraUseCase;
    actualizarOrdenCompraUseCase: ActualizarOrdenCompraUseCase;
    eliminarOrdenCompraUseCase: EliminarOrdenCompraUseCase;
  };
  createAuthContext(): {
    unitOfWork: IUnitOfWork;
    usuarioRepository: UsuarioRepository;
    listarUsuariosUseCase: ListarUsuariosUseCase;
    registerUsuarioUseCase: RegisterUsuarioUseCase;
    loginUsuarioUseCase: LoginUsuarioUseCase;
    loginGoogleUseCase?: LoginGoogleUseCase;
    verifySegundoFactorUseCase: VerifySegundoFactorUseCase;
  };
}

const logger = new Logger();
const passwordService = new PasswordService();
const tokenService = new JwtService(Bun.env.JWT_SECRET ?? "dev-secret-change-me", 60 * 60);
const googleAudiences = (Bun.env.GOOGLE_CLIENT_ID ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const googleIdentityService =
  googleAudiences.length > 0 ? new GoogleIdentityService(googleAudiences) : undefined;
const smtpHost = Bun.env.SMTP_HOST?.trim();
const smtpPort = Number(Bun.env.SMTP_PORT ?? 587);
const smtpSecure = (Bun.env.SMTP_SECURE ?? "false") === "true";
const smtpUser = Bun.env.SMTP_USER?.trim();
const smtpPass = Bun.env.SMTP_PASS?.trim();
const smtpFrom = Bun.env.SMTP_FROM?.trim() || smtpUser;
const emailService =
  smtpHost && smtpUser && smtpPass && smtpFrom
    ? new SmtpEmailService({
        host: smtpHost,
        port: Number.isFinite(smtpPort) ? smtpPort : 587,
        secure: smtpSecure,
        user: smtpUser,
        pass: smtpPass,
        from: smtpFrom,
      })
    : undefined;
const twoFactorEmailOverride = Bun.env.TWO_FACTOR_EMAIL_OVERRIDE?.trim() || undefined;

export const container: AppContainer = {
  logger,
  passwordService,
  tokenService,
  emailService,
  googleIdentityService,
  createArticuloContext() {
    const unitOfWork = new TypeOrmUnitOfWork(AppDataSource);
    const articuloRepository = new ArticuloRepository(unitOfWork);

    return {
      unitOfWork,
      articuloRepository,
      crearArticuloUseCase: new CrearArticuloUseCase(articuloRepository, unitOfWork),
      listarArticulosUseCase: new ListarArticulosUseCase(articuloRepository),
      obtenerArticuloUseCase: new ObtenerArticuloUseCase(articuloRepository),
      actualizarArticuloUseCase: new ActualizarArticuloUseCase(articuloRepository, unitOfWork),
      eliminarArticuloUseCase: new EliminarArticuloUseCase(articuloRepository),
    };
  },
  createProveedorContext() {
    const unitOfWork = new TypeOrmUnitOfWork(AppDataSource);
    const proveedorRepository = new ProveedorRepository(unitOfWork);

    return {
      unitOfWork,
      proveedorRepository,
      crearProveedorUseCase: new CrearProveedorUseCase(proveedorRepository, unitOfWork),
      listarProveedoresUseCase: new ListarProveedoresUseCase(proveedorRepository),
      obtenerProveedorUseCase: new ObtenerProveedorUseCase(proveedorRepository),
      actualizarProveedorUseCase: new ActualizarProveedorUseCase(proveedorRepository, unitOfWork),
      eliminarProveedorUseCase: new EliminarProveedorUseCase(proveedorRepository),
    };
  },
  createOrdenCompraContext() {
    const unitOfWork = new TypeOrmUnitOfWork(AppDataSource);
    const ordenCompraRepository = new OrdenCompraRepository(unitOfWork);

    return {
      unitOfWork,
      ordenCompraRepository,
      crearOrdenCompraUseCase: new CrearOrdenCompraUseCase(ordenCompraRepository, unitOfWork),
      listarOrdenesCompraUseCase: new ListarOrdenesCompraUseCase(ordenCompraRepository),
      obtenerOrdenCompraUseCase: new ObtenerOrdenCompraUseCase(ordenCompraRepository),
      actualizarOrdenCompraUseCase: new ActualizarOrdenCompraUseCase(ordenCompraRepository, unitOfWork),
      eliminarOrdenCompraUseCase: new EliminarOrdenCompraUseCase(ordenCompraRepository),
    };
  },
  createAuthContext() {
    const unitOfWork = new TypeOrmUnitOfWork(AppDataSource);
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
      unitOfWork,
      usuarioRepository,
      listarUsuariosUseCase: new ListarUsuariosUseCase(usuarioRepository),
      registerUsuarioUseCase: new RegisterUsuarioUseCase(usuarioRepository, passwordService, unitOfWork),
      loginUsuarioUseCase: new LoginUsuarioUseCase(usuarioRepository, passwordService, authSessionService),
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
