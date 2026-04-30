import type { DataSource } from "typeorm";
import type { IAuditService } from "src/application/interfaces/IAuditService";
import type { IEmailService } from "src/application/interfaces/IEmailService";
import type { IGoogleIdentityService } from "src/application/interfaces/IGoogleIdentityService";
import type { ILogger } from "src/application/interfaces/ILogger";
import type { IPasswordService } from "src/application/interfaces/IPasswordService";
import type { ITokenService } from "src/application/interfaces/ITokenService";
import type { ITwoFactorPhoneService } from "src/application/interfaces/ITwoFactorPhoneService";
import { AuthSessionService } from "src/application/use-cases/auth/AuthSessionService";
import { AuditoriaQueryService } from "src/application/use-cases/auditoria/AuditoriaQueryService";
import { CatalogoQueryService } from "src/application/use-cases/catalogo/CatalogoQueryService";
import { ListarUsuariosUseCase } from "src/application/use-cases/auth/ListarUsuariosUseCase";
import { LoginGoogleUseCase } from "src/application/use-cases/auth/LoginGoogleUseCase";
import { LoginUsuarioUseCase } from "src/application/use-cases/auth/LoginUsuarioUseCase";
import { ObtenerUsuarioActualUseCase } from "src/application/use-cases/auth/ObtenerUsuarioActualUseCase";
import { RegisterUsuarioUseCase } from "src/application/use-cases/auth/RegisterUsuarioUseCase";
import { VerifySegundoFactorUseCase } from "src/application/use-cases/auth/VerifySegundoFactorUseCase";
import type { SegundoFactorCanalEntrega } from "src/domain/entities/SegundoFactorCanal";
import { ActualizarArticuloUseCase } from "src/application/use-cases/articulo/ActualizarArticuloUseCase";
import { CrearArticuloUseCase } from "src/application/use-cases/articulo/CrearArticuloUseCase";
import { EliminarArticuloUseCase } from "src/application/use-cases/articulo/EliminarArticuloUseCase";
import { ListarArticulosUseCase } from "src/application/use-cases/articulo/ListarArticulosUseCase";
import { ObtenerArticuloUseCase } from "src/application/use-cases/articulo/ObtenerArticuloUseCase";
import { CrearCuentaPorPagarUseCase } from "src/application/use-cases/cxp/CrearCuentaPorPagarUseCase";
import { CuentasPorPagarService } from "src/application/use-cases/cxp/CuentasPorPagarService";
import { InventarioService } from "src/application/use-cases/inventario/InventarioService";
import { GoogleIdentityService } from "src/infrastructure/auth/GoogleIdentityService";
import { ActualizarProveedorUseCase } from "src/application/use-cases/proveedor/ActualizarProveedorUseCase";
import { CrearProveedorUseCase } from "src/application/use-cases/proveedor/CrearProveedorUseCase";
import { EliminarProveedorUseCase } from "src/application/use-cases/proveedor/EliminarProveedorUseCase";
import { ListarProveedoresUseCase } from "src/application/use-cases/proveedor/ListarProveedoresUseCase";
import { ObtenerProveedorUseCase } from "src/application/use-cases/proveedor/ObtenerProveedorUseCase";
import { ActualizarOrdenCompraUseCase } from "src/application/use-cases/orden-compra/ActualizarOrdenCompraUseCase";
import { AprobarOrdenCompraUseCase } from "src/application/use-cases/orden-compra/AprobarOrdenCompraUseCase";
import { CrearOrdenCompraUseCase } from "src/application/use-cases/orden-compra/CrearOrdenCompraUseCase";
import { EliminarOrdenCompraUseCase } from "src/application/use-cases/orden-compra/EliminarOrdenCompraUseCase";
import { ListarOrdenesCompraUseCase } from "src/application/use-cases/orden-compra/ListarOrdenesCompraUseCase";
import { ObtenerOrdenCompraUseCase } from "src/application/use-cases/orden-compra/ObtenerOrdenCompraUseCase";
import { RegistrarRecepcionOrdenCompraUseCase } from "src/application/use-cases/orden-compra/RegistrarRecepcionOrdenCompraUseCase";
import { JwtService } from "src/infrastructure/auth/JwtService";
import { PasswordService } from "src/infrastructure/auth/PasswordService";
import { TwilioTwoFactorPhoneService } from "src/infrastructure/auth/TwilioTwoFactorPhoneService";
import { SmtpEmailService } from "src/infrastructure/email/SmtpEmailService";
import { Logger } from "src/infrastructure/logging/Logger";
import { createAppDataSource } from "src/infrastructure/persistence/postgres/orm/data-source";
import { ArticuloRepository } from "src/infrastructure/persistence/postgres/repositories/ArticuloRepository";
import { AuditoriaEventoRepository } from "src/infrastructure/persistence/postgres/repositories/AuditoriaEventoRepository";
import { CatalogoRepository } from "src/infrastructure/persistence/postgres/repositories/CatalogoRepository";
import { CodigoSegundoFactorRepository } from "src/infrastructure/persistence/postgres/repositories/CodigoSegundoFactorRepository";
import { CuentaPorPagarRepository } from "src/infrastructure/persistence/postgres/repositories/CuentaPorPagarRepository";
import { ImpuestoRepository } from "src/infrastructure/persistence/postgres/repositories/ImpuestoRepository";
import { OrdenCompraRepository } from "src/infrastructure/persistence/postgres/repositories/OrdenCompraRepository";
import { PagoProveedorRepository } from "src/infrastructure/persistence/postgres/repositories/PagoProveedorRepository";
import { ProveedorRepository } from "src/infrastructure/persistence/postgres/repositories/ProveedorRepository";
import { RefreshTokenSesionRepository } from "src/infrastructure/persistence/postgres/repositories/RefreshTokenSesionRepository";
import { UsuarioRepository } from "src/infrastructure/persistence/postgres/repositories/UsuarioRepository";
import { ArticuloAlmacenRepository } from "src/infrastructure/persistence/postgres/repositories/ArticuloAlmacenRepository";
import { DiarioInventarioRepository } from "src/infrastructure/persistence/postgres/repositories/DiarioInventarioRepository";
import { TypeOrmUnitOfWork } from "src/infrastructure/persistence/postgres/unit-of-work/TypeOrmUnitOfWork";
import type { HttpDependencies } from "src/presentation/http/dependencies";

export interface AppContainer extends HttpDependencies {
  logger: ILogger;
  passwordService: IPasswordService;
  tokenService: ITokenService;
  emailService?: IEmailService;
  twoFactorPhoneService?: ITwoFactorPhoneService;
  googleIdentityService?: IGoogleIdentityService;
  auditService?: IAuditService;
}

export interface ContainerOptions {
  dataSource?: DataSource;
  logger?: ILogger;
  passwordService?: IPasswordService;
  tokenService?: ITokenService;
  emailService?: IEmailService;
  twoFactorPhoneService?: ITwoFactorPhoneService;
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
  const smtpTlsRejectUnauthorized = (Bun.env.SMTP_TLS_REJECT_UNAUTHORIZED ?? "true") !== "false";

  return smtpHost && smtpUser && smtpPass && smtpFrom
    ? new SmtpEmailService({
        host: smtpHost,
        port: Number.isFinite(smtpPort) ? smtpPort : 587,
        secure: smtpSecure,
        user: smtpUser,
        pass: smtpPass,
        from: smtpFrom,
        tlsRejectUnauthorized: smtpTlsRejectUnauthorized,
      })
    : undefined;
};

const createTwoFactorPhoneService = (): ITwoFactorPhoneService | undefined => {
  const accountSid = Bun.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = Bun.env.TWILIO_AUTH_TOKEN?.trim();
  const fromPhone = Bun.env.TWILIO_FROM_PHONE?.trim();
  const whatsappContentSid = Bun.env.TWILIO_WHATSAPP_CONTENT_SID?.trim() || undefined;

  return accountSid && authToken && fromPhone
    ? new TwilioTwoFactorPhoneService({
        accountSid,
        authToken,
        fromPhone,
        whatsappContentSid,
      })
    : undefined;
};

const resolveTwoFactorDefaultChannel = (): SegundoFactorCanalEntrega => {
  const value = (Bun.env.TWO_FACTOR_DEFAULT_CHANNEL ?? "EMAIL").trim().toUpperCase();
  if (value === "EMAIL" || value === "SMS" || value === "WHATSAPP" || value === "VOICE") {
    return value;
  }

  throw new Error("TWO_FACTOR_DEFAULT_CHANNEL debe ser EMAIL, SMS, WHATSAPP o VOICE");
};

export const createContainer = (options: ContainerOptions = {}): AppContainer => {
  const dataSource = options.dataSource ?? createAppDataSource();
  const logger = options.logger ?? new Logger();
  const passwordService = options.passwordService ?? new PasswordService();
  const nodeEnv = (Bun.env.NODE_ENV ?? "development").trim().toLowerCase();
  const jwtSecret = Bun.env.JWT_SECRET?.trim();
  const resolvedJwtSecret = jwtSecret || "dev-secret-change-me";

  if (nodeEnv === "production" && (!jwtSecret || jwtSecret === "dev-secret-change-me")) {
    throw new Error("JWT_SECRET seguro es obligatorio cuando NODE_ENV=production");
  }

  const tokenService = options.tokenService ?? new JwtService(resolvedJwtSecret, 60 * 60);
  const emailService = options.emailService ?? createEmailService();
  const twoFactorPhoneService = options.twoFactorPhoneService ?? createTwoFactorPhoneService();
  const googleIdentityService = options.googleIdentityService ?? createGoogleIdentityService();
  const auditService = options.auditService;
  const twoFactorEmailOverride = Bun.env.TWO_FACTOR_EMAIL_OVERRIDE?.trim() || undefined;
  const twoFactorPhoneOverride = Bun.env.TWO_FACTOR_PHONE_OVERRIDE?.trim() || undefined;
  const twoFactorDefaultChannel = resolveTwoFactorDefaultChannel();

  return {
    logger,
    passwordService,
    tokenService,
    emailService,
    twoFactorPhoneService,
    googleIdentityService,
    auditService,
    async isReady() {
      try {
        if (!dataSource.isInitialized) {
          return false;
        }

        await dataSource.query("SELECT 1");
        return true;
      } catch {
        return false;
      }
    },
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
      const articuloAlmacenRepository = new ArticuloAlmacenRepository(unitOfWork);
      const diarioInventarioRepository = new DiarioInventarioRepository(unitOfWork);
      const auditoriaEventoRepository = new AuditoriaEventoRepository(unitOfWork);

      return {
        crearOrdenCompraUseCase: new CrearOrdenCompraUseCase(
          ordenCompraRepository,
          impuestoRepository,
          unitOfWork,
          auditoriaEventoRepository,
        ),
        listarOrdenesCompraUseCase: new ListarOrdenesCompraUseCase(ordenCompraRepository),
        obtenerOrdenCompraUseCase: new ObtenerOrdenCompraUseCase(ordenCompraRepository),
        actualizarOrdenCompraUseCase: new ActualizarOrdenCompraUseCase(
          ordenCompraRepository,
          impuestoRepository,
          unitOfWork,
        ),
        aprobarOrdenCompraUseCase: new AprobarOrdenCompraUseCase(
          ordenCompraRepository,
          unitOfWork,
          auditoriaEventoRepository,
        ),
        registrarRecepcionOrdenCompraUseCase: new RegistrarRecepcionOrdenCompraUseCase(
          ordenCompraRepository,
          impuestoRepository,
          articuloAlmacenRepository,
          diarioInventarioRepository,
          unitOfWork,
          auditoriaEventoRepository,
        ),
        eliminarOrdenCompraUseCase: new EliminarOrdenCompraUseCase(ordenCompraRepository),
      };
    },
    createCatalogoContext() {
      const unitOfWork = new TypeOrmUnitOfWork(dataSource);
      const catalogoRepository = new CatalogoRepository(unitOfWork);
      const catalogoQueryService = new CatalogoQueryService(catalogoRepository);

      return {
        listarRolesUseCase: {
          execute: () => catalogoQueryService.listarRoles(),
        },
        listarMonedasUseCase: {
          execute: () => catalogoQueryService.listarMonedas(),
        },
        listarImpuestosUseCase: {
          execute: () => catalogoQueryService.listarImpuestos(),
        },
        listarGruposArticuloUseCase: {
          execute: () => catalogoQueryService.listarGruposArticulo(),
        },
        listarAlmacenesUseCase: {
          execute: () => catalogoQueryService.listarAlmacenes(),
        },
        listarEstadosDocumentoUseCase: {
          execute: () => catalogoQueryService.listarEstadosDocumento(),
        },
        listarTiposDocumentoUseCase: {
          execute: () => catalogoQueryService.listarTiposDocumento(),
        },
      };
    },
    createCuentasPorPagarContext() {
      const unitOfWork = new TypeOrmUnitOfWork(dataSource);
      const ordenCompraRepository = new OrdenCompraRepository(unitOfWork);
      const cuentaPorPagarRepository = new CuentaPorPagarRepository(unitOfWork);
      const pagoProveedorRepository = new PagoProveedorRepository(unitOfWork);
      const auditoriaEventoRepository = new AuditoriaEventoRepository(unitOfWork);
      const cuentasPorPagarService = new CuentasPorPagarService(
        cuentaPorPagarRepository,
        pagoProveedorRepository,
        unitOfWork,
        auditoriaEventoRepository,
      );

      return {
        crearCuentaPorPagarUseCase: new CrearCuentaPorPagarUseCase(
          cuentasPorPagarService,
          ordenCompraRepository,
        ),
        listarCuentasPorPagarUseCase: {
          execute: () => cuentasPorPagarService.listarCuentasPorPagar(),
        },
        obtenerCuentaPorPagarUseCase: {
          execute: (id: string) => cuentasPorPagarService.obtenerCuentaPorPagar(id),
        },
        registrarPagoProveedorUseCase: {
          execute: (id, dto, currentUserId) =>
            cuentasPorPagarService.registrarPagoProveedor(id, dto, currentUserId),
        },
        listarPagosProveedorUseCase: {
          execute: () => cuentasPorPagarService.listarPagosProveedor(),
        },
        obtenerPagoProveedorUseCase: {
          execute: (id: string) => cuentasPorPagarService.obtenerPagoProveedor(id),
        },
      };
    },
    createInventarioContext() {
      const unitOfWork = new TypeOrmUnitOfWork(dataSource);
      const articuloAlmacenRepository = new ArticuloAlmacenRepository(unitOfWork);
      const diarioInventarioRepository = new DiarioInventarioRepository(unitOfWork);
      const auditoriaEventoRepository = new AuditoriaEventoRepository(unitOfWork);
      const inventarioService = new InventarioService(
        articuloAlmacenRepository,
        diarioInventarioRepository,
        unitOfWork,
        auditoriaEventoRepository,
      );

      return {
        listarStocksUseCase: {
          execute: (articuloId?: string) =>
            articuloId
              ? inventarioService.listarStocksPorArticulo(articuloId)
              : inventarioService.listarStocks(),
        },
        listarMovimientosInventarioUseCase: {
          execute: () => inventarioService.listarMovimientos(),
        },
        obtenerMovimientoInventarioUseCase: {
          execute: (id: string) => inventarioService.obtenerMovimiento(id),
        },
      };
    },
    createAuditoriaContext() {
      const unitOfWork = new TypeOrmUnitOfWork(dataSource);
      const auditoriaEventoRepository = new AuditoriaEventoRepository(unitOfWork);
      const auditoriaQueryService = new AuditoriaQueryService(auditoriaEventoRepository);

      return {
        listarAuditoriaEventosUseCase: {
          execute: () => auditoriaQueryService.listarEventos(),
        },
        obtenerAuditoriaEventoUseCase: {
          execute: (id: string) => auditoriaQueryService.obtenerEvento(id),
        },
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
        twoFactorPhoneService,
        twoFactorEmailOverride,
        twoFactorPhoneOverride,
        twoFactorDefaultChannel,
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
