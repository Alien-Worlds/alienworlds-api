import {
  AbiDto,
  AbiExtensionDto,
  ErrorMessageDto,
  FieldDto,
  RicardianClauseDto,
  StructDto,
  TableDto,
  TypeDto,
  VariantDto,
} from '@common/abi/data/dtos/abi.dto';
import { Action } from '@common/actions/domain/entities/action';
import { Serialize } from 'eosjs';
import { getTypesFromAbi } from 'eosjs/dist/eosjs-serialize';

/**
 * Type entity
 * @class
 */
export class CustomType {
  /**
   *
   * @param {string} newTypeName
   * @param {string} type
   */
  private constructor(
    public readonly newTypeName: string,
    public readonly type: string
  ) {}

  /**
   * Parse Type entity to DTO
   * @returns {TypeDto}
   */
  public toDto(): TypeDto {
    return {
      new_type_name: this.newTypeName,
      type: this.type,
    };
  }

  /**
   * Create ABI entity based on provided DTO
   *
   * @static
   * @param {TypeDto} dto
   * @returns {CustomType}
   */
  public static fromDto(dto: TypeDto): CustomType {
    const { new_type_name, type } = dto;
    return new CustomType(new_type_name, type);
  }
}

/**
 * @class
 */
export class Struct {
  /**
   *
   * @param {string} name
   * @param {string} base - Inheritance, parent struct
   * @param {StructField[]} fields - Array of field objects describing the struct's fields
   */
  private constructor(
    public readonly name: string,
    public readonly base: string,
    public readonly fields: StructField[]
  ) {}

  /**
   * @returns {StructDto}
   */
  public toDto(): StructDto {
    return {
      name: this.name,
      base: this.base,
      fields: this.fields.map(field => field.toDto()),
    };
  }

  /**
   * @static
   * @param {StructDto} dto
   * @returns {Struct}
   */
  public static fromDto(dto: StructDto): Struct {
    const { name, base, fields } = dto;
    return new Struct(name, base, fields.map(StructField.fromDto));
  }
}

/**
 * @class
 */
export class StructField {
  /**
   *
   * @param {string} name - The field's name
   * @param {string} type - The field's type
   */
  private constructor(
    public readonly name: string,
    public readonly type: string
  ) {}

  /**
   * @returns {FieldDto}
   */
  public toDto(): FieldDto {
    const { name, type } = this;
    return { name, type };
  }

  /**
   * @static
   * @param {FieldDto} dto
   * @returns {StructField}
   */
  public static fromDto(dto: FieldDto): StructField {
    const { name, type } = dto;
    return new StructField(name, type);
  }
}

/**
 * @class
 */
export class RicardianClause {
  /**
   *
   * @param {string} id
   * @param {string} body
   */
  private constructor(
    public readonly id: string,
    public readonly body: string
  ) {}

  /**
   * @returns {RicardianClauseDto}
   */
  public toDto(): RicardianClauseDto {
    const { id, body } = this;
    return { id, body };
  }

  /**
   * @static
   * @param {RicardianClauseDto} dto
   * @returns {RicardianClause}
   */
  public static fromDto(dto: RicardianClauseDto): RicardianClause {
    const { id, body } = dto;
    return new RicardianClause(id, body);
  }
}

/**
 * @class
 */
export class AbiExtension {
  /**
   *
   * @param {number} tag
   * @param {string} value
   */
  private constructor(
    public readonly tag: number,
    public readonly value: string
  ) {}

  /**
   * @returns {AbiExtensionDto}
   */
  public toDto(): AbiExtensionDto {
    const { tag, value } = this;
    return { tag, value };
  }

  /**
   * @static
   * @param {AbiExtensionDto} dto
   * @returns {AbiExtension}
   */
  public static fromDto(dto: AbiExtensionDto): AbiExtension {
    const { tag, value } = dto;
    return new AbiExtension(tag, value);
  }
}

/**
 * @class
 */
export class ErrorMessage {
  /**
   *
   * @param {string} errorCode
   * @param {string} message
   */
  private constructor(
    public readonly errorCode: string,
    public readonly message: string
  ) {}

  /**
   * @returns {ErrorMessageDto}
   */
  public toDto(): ErrorMessageDto {
    const { errorCode, message } = this;
    return { error_code: errorCode, error_msg: message };
  }

  /**
   * @static
   * @param {ErrorMessageDto} dto
   * @returns {ErrorMessage}
   */
  public static fromDto(dto: ErrorMessageDto): ErrorMessage {
    const { error_code, error_msg } = dto;
    return new ErrorMessage(error_code, error_msg);
  }
}

/**
 * @class
 */
export class Variant {
  /**
   *
   * @param {string} name
   * @param {string[]} types
   */
  private constructor(
    public readonly name: string,
    public readonly types: string[]
  ) {}

  /**
   * @returns {VariantDto}
   */
  public toDto(): VariantDto {
    const { name, types } = this;
    return { name, types };
  }

  /**
   * @static
   * @param {VariantDto} dto
   * @returns {Variant}
   */
  public static fromDto(dto: VariantDto): Variant {
    const { name, types } = dto;
    return new Variant(name, types);
  }
}

/**
 * @class
 */
export class Table {
  /**
   *
   * @param {string} name - The name of the table, determined during instantiation.
   * @param {string} type - The table's corresponding struct
   * @param {string} indexType - The type of primary index of this table
   * @param {string[]} keyNames - An array of key names, length must equal length of key_types member
   * @param {string[]} keyTypes - An array of key types that correspond to key names array member, length of array must equal length of key names array.
   */
  private constructor(
    public readonly name: string,
    public readonly type: string,
    public readonly indexType: string,
    public readonly keyNames: string[],
    public readonly keyTypes: string[]
  ) {}

  /**
   * @returns {FieldDto}
   */
  public toDto(): TableDto {
    const { name, type, indexType, keyNames, keyTypes } = this;
    return {
      name,
      type,
      index_type: indexType,
      key_names: keyNames,
      key_types: keyTypes,
    };
  }

  /**
   * @static
   * @param {TableDto} dto
   * @returns {Table}
   */
  public static fromDto(dto: TableDto): Table {
    const { name, type, index_type, key_names, key_types } = dto;
    return new Table(name, type, index_type, key_names, key_types);
  }
}

/**
 * ABI entity
 * @class
 */
export class Abi {
  private typesMap: Map<string, Serialize.Type>;
  /**
   *
   * @param {string} version
   * @param {CustomType[]} types
   * @param {Struct[]} structs
   * @param {Action[]} actions
   * @param {Table[]} tables
   * @param {RicardianClause[]} ricardianClauses
   * @param {AbiExtension[]} abiExtensions
   * @param {ErrorMessage[]} errorMessages
   * @param {string} comment
   * @param {Variant[]} variants
   */
  private constructor(
    public readonly version: string,
    public readonly types: CustomType[],
    public readonly structs: Struct[],
    public readonly tables: Table[],
    public readonly actions: Action[],
    public readonly ricardianClauses: RicardianClause[],
    public readonly abiExtensions: AbiExtension[],
    public readonly errorMessages: ErrorMessage[],
    public readonly variants?: Variant[]
  ) {
    this.typesMap = getTypesFromAbi(
      Serialize.createInitialTypes(),
      this.toDto()
    );
  }

  /**
   * Parse ABI entity to DTO
   * @returns {AbiDto}
   */
  public toDto(): AbiDto {
    const {
      version,
      types,
      structs,
      actions,
      tables,
      ricardianClauses,
      abiExtensions,
      errorMessages,
      variants,
    } = this;

    const dto: AbiDto = {
      version,
      types: types.map(item => item.toDto()),
      structs: structs.map(item => item.toDto()),
      tables: tables.map(item => item.toDto()),
      actions: actions ? actions.map(item => item.toDto()) : [],
      ricardian_clauses: ricardianClauses
        ? ricardianClauses.map(item => item.toDto())
        : [],
      abi_extensions: abiExtensions
        ? abiExtensions.map(item => item.toDto())
        : [],
      error_messages: errorMessages
        ? errorMessages.map(item => item.toDto())
        : [],
      variants: variants ? variants.map(item => item.toDto()) : [],
    };

    return dto;
  }

  public getTypesMap(): Map<string, Serialize.Type> {
    return this.typesMap;
  }

  /**
   * Create ABI entity based on provided DTO
   *
   * @static
   * @param {AbiDto} dto
   * @returns {Abi}
   */
  public static fromDto(dto: AbiDto): Abi {
    const { version, types, structs, tables } = dto;
    const actions = dto.actions ? dto.actions.map(Action.fromDto) : [];
    const ricardian_clauses = dto.ricardian_clauses
      ? dto.ricardian_clauses.map(RicardianClause.fromDto)
      : [];
    const abi_extensions = dto.abi_extensions
      ? dto.abi_extensions.map(AbiExtension.fromDto)
      : [];
    const error_messages = dto.error_messages
      ? dto.error_messages.map(ErrorMessage.fromDto)
      : [];
    const variants = dto.variants ? dto.variants.map(Variant.fromDto) : [];

    return new Abi(
      version,
      types.map(CustomType.fromDto),
      structs.map(Struct.fromDto),
      tables.map(Table.fromDto),
      actions,
      ricardian_clauses,
      abi_extensions,
      error_messages,
      variants
    );
  }
}
