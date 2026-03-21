
/**
 * A port for generation of UUIDv4s
 */
export interface UuidGenerator {
  /**
   * Generates a UUIDv4
   *
   * @returns The UUID
   */
  generate(): string;
}
