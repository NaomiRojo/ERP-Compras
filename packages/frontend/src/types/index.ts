export type ViewKey =
  | "dashboard"
  | "usuarios"
  | "proveedores"
  | "articulos"
  | "ordenes"
  | "inventario"
  | "cxp"
  | "pagos"
  | "reportes"
  | "auditoria";

export type UserRole = "ADMIN" | "COMPRAS" | "ALMACEN" | "SUPERVISOR";
export type Currency = string;
export type OrderStatus = string;
export type CxpStatus = string;
export type BadgeTone = "neutral" | "info" | "success" | "warning";

export type User = {
  id: string;
  username: string;
  nombreCompleto: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  twoFactorEnabled: boolean;
};

export type Provider = {
  id: string;
  cardCode: string;
  cardName: string;
  nombreComercial: string;
  nitRut: string;
  email: string;
  telefono: string;
  direccion: string;
  moneda: Currency;
  monedaId: number;
  lineaCredito: number;
  balance: number;
  activo: boolean;
};

export type Article = {
  id: string;
  itemCode: string;
  itemName: string;
  descripcion: string;
  unidad: string;
  costo: number;
  grupo: string;
  grupoId: number;
  impuesto: string;
  impuestoId: number;
  activo: boolean;
};

export type OrderLine = {
  id: string;
  lineNum: number;
  articuloId: string;
  almacenId: string;
  impuestoId: number;
  sku: string;
  description: string;
  qty: number;
  pendingQty: number;
  price: number;
  discount: number;
  lineSubtotal: number;
  lineTotal: number;
};

export type TimelineEvent = {
  date: string;
  action: string;
  user: string;
  note: string;
};

export type Order = {
  id: string;
  docNum: string;
  proveedorId: string;
  proveedor: string;
  estadoId: number;
  estado: OrderStatus;
  fechaDocumento: string;
  fecha: string;
  fechaVencimiento?: string;
  total: number;
  subtotal: number;
  descuentoTotal: number;
  impuestosTotal: number;
  moneda: Currency;
  monedaId: number;
  comentarios: string;
  createdBy: string;
  approvedBy?: string;
  lines: OrderLine[];
  timeline: TimelineEvent[];
};

export type AccountsPayable = {
  id: string;
  compraId: string;
  proveedorId: string;
  proveedor: string;
  factura: string;
  total: number;
  saldo: number;
  vencimiento: string;
  estado: CxpStatus;
};

export type Payment = {
  id: string;
  cuentaPorPagarId: string;
  proveedorId: string;
  proveedor: string;
  monto: number;
  fecha: string;
  referencia: string;
  usuario: string;
};

export type InventoryRow = {
  id: string;
  articuloId: string;
  almacenId: string;
  sku: string;
  nombre: string;
  almacen: string;
  fisico: number;
  comprometido: number;
  solicitado: number;
  disponible: number;
};

export type Movement = {
  id: string;
  articuloId: string;
  almacenId: string;
  docReferenciaId: string;
  fecha: string;
  sku: string;
  almacen: string;
  tipo: "ENT" | "SAL";
  cant: number;
  ref: string;
  comentario: string;
  costoMomento: number;
  usuario: string;
};

export type AuditRow = {
  id: string;
  fecha: string;
  usuario: string;
  entidad: string;
  entidadId?: string;
  accion: string;
  dataAntes: unknown;
  dataDespues: unknown;
  ipOrigen?: string;
};

export type Metric = {
  label: string;
  value: string;
  hint: string;
};

export type NavItem = {
  key: ViewKey;
  label: string;
  description: string;
};

export type AppData = {
  users: User[];
  proveedores: Provider[];
  articulos: Article[];
  ordenes: Order[];
  cxp: AccountsPayable[];
  pagos: Payment[];
  inventario: InventoryRow[];
  movimientos: Movement[];
  auditoria: AuditRow[];
};
