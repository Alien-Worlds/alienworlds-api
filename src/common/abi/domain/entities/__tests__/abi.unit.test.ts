import 'reflect-metadata';
import {
  Abi,
  AbiExtension,
  CustomType,
  ErrorMessage,
  RicardianClause,
  Struct,
  StructField,
  Table,
  Variant,
} from '../abi';

jest.mock('eosjs/dist/eosjs-serialize');

const typeDto = {
  new_type_name: 'some_name',
  type: 'some_type',
};

const variantDto = {
  name: 'SOME_NAME',
  types: ['TYPE_1', 'TYPE_2'],
};

const customTypeDto = {
  new_type_name: 'SOME_TYPE_NAME',
  type: 'SOME_TYPE',
};

const structDto = {
  name: 'foo.name',
  base: 'FOO',
  fields: [{ name: 'FIELD_NAME', type: 'FIELD_TYPE' }],
};

const structFieldDto = {
  name: 'FIELD_NAME',
  type: 'FIELD_TYPE',
};

const ricardianClauseDto = {
  id: 'SOME_ID',
  body: 'SOME_BODY',
};

const abiExtensionDto = {
  tag: 12345,
  value: 'SOME_BODY',
};

const errorMessageDto = {
  error_code: '200',
  error_msg: 'SOME_MESSAGE',
};

const tableDto = {
  name: 'accounts',
  type: 'account',
  index_type: 'i64',
  key_names: ['KEY_NAME_1'],
  key_types: ['KEY_TYPE_1'],
};

const actionDto = {
  name: 'create',
  type: 'create',
  ricardian_contract: 'contract',
};

const abiDto = {
  version: 'version_1',
  types: [typeDto],
  structs: [structDto],
  tables: [tableDto],
  actions: [actionDto],
  ricardian_clauses: [ricardianClauseDto],
  abi_extensions: [abiExtensionDto],
  error_messages: [errorMessageDto],
  variants: [variantDto],
};

describe('CustomType Unit tests', () => {
  it('"fromDto" should create entity', () => {
    const entity = CustomType.fromDto(customTypeDto);
    expect(entity.toDto()).toEqual(customTypeDto);
  });

  it('"toDto" should create dto from entity', () => {
    const entity = CustomType.fromDto(customTypeDto);
    expect(entity.toDto()).toEqual(customTypeDto);
  });
});

describe('Struct Unit tests', () => {
  it('"fromDto" should create entity', () => {
    const entity = Struct.fromDto(structDto);
    expect(entity.toDto()).toEqual(structDto);
  });

  it('"toDto" should create dto from entity', () => {
    const entity = Struct.fromDto(structDto);
    expect(entity.toDto()).toEqual(structDto);
  });
});

describe('StructField Unit tests', () => {
  it('"fromDto" should create entity', () => {
    const entity = StructField.fromDto(structFieldDto);
    expect(entity.toDto()).toEqual(structFieldDto);
  });

  it('"toDto" should create dto from entity', () => {
    const entity = StructField.fromDto(structFieldDto);
    expect(entity.toDto()).toEqual(structFieldDto);
  });
});

describe('RicardianClause Unit tests', () => {
  it('"fromDto" should create entity', () => {
    const entity = RicardianClause.fromDto(ricardianClauseDto);
    expect(entity.toDto()).toEqual(ricardianClauseDto);
  });

  it('"toDto" should create dto from entity', () => {
    const entity = RicardianClause.fromDto(ricardianClauseDto);
    expect(entity.toDto()).toEqual(ricardianClauseDto);
  });
});

describe('AbiExtension Unit tests', () => {
  it('"fromDto" should create entity', () => {
    const entity = AbiExtension.fromDto(abiExtensionDto);
    expect(entity.toDto()).toEqual(abiExtensionDto);
  });

  it('"toDto" should create dto from entity', () => {
    const entity = AbiExtension.fromDto(abiExtensionDto);
    expect(entity.toDto()).toEqual(abiExtensionDto);
  });
});

describe('ErrorMessage Unit tests', () => {
  it('"fromDto" should create entity', () => {
    const entity = ErrorMessage.fromDto(errorMessageDto);
    expect(entity.toDto()).toEqual(errorMessageDto);
  });

  it('"toDto" should create dto from entity', () => {
    const entity = ErrorMessage.fromDto(errorMessageDto);
    expect(entity.toDto()).toEqual(errorMessageDto);
  });
});

describe('Variant Unit tests', () => {
  it('"fromDto" should create entity', () => {
    const entity = Variant.fromDto(variantDto);
    expect(entity.toDto()).toEqual(variantDto);
  });

  it('"toDto" should create dto from entity', () => {
    const entity = Variant.fromDto(variantDto);
    expect(entity.toDto()).toEqual(variantDto);
  });
});

describe('Table Unit tests', () => {
  it('"fromDto" should create entity', () => {
    const entity = Table.fromDto(tableDto);
    expect(entity.toDto()).toEqual(tableDto);
  });

  it('"toDto" should create dto from entity', () => {
    const entity = Table.fromDto(tableDto);
    expect(entity.toDto()).toEqual(tableDto);
  });
});

describe('Abi Unit tests', () => {
  it('"fromDto" should create entity', () => {
    const entity = Abi.fromDto(abiDto);
    expect(entity.toDto()).toEqual(abiDto);
  });

  it('"toDto" should create dto from entity', () => {
    const entity = Abi.fromDto(abiDto);
    expect(entity.toDto()).toEqual(abiDto);
  });
});
