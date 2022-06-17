import { Serialize } from 'eosjs';
import { TextDecoder, TextEncoder } from 'text-encoding';

export const serializeMessage = (
  type: string,
  value: unknown,
  types: Map<string, Serialize.Type>
) => {
  const buffer = new Serialize.SerialBuffer({
    textEncoder: new TextEncoder(),
    textDecoder: new TextDecoder(),
  });
  Serialize.getType(types, type).serialize(buffer, value);
  return buffer.asUint8Array();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deserializeMessage = <T = any>(
  type: string,
  array: Uint8Array,
  types: Map<string, Serialize.Type>
): T => {
  const buffer = new Serialize.SerialBuffer({
    textEncoder: new TextEncoder(),
    textDecoder: new TextDecoder(),
    array,
  });
  const result = Serialize.getType(types, type).deserialize(
    buffer,
    new Serialize.SerializerState({ bytesAsUint8Array: true })
  );
  if (buffer.readPos != array.length) throw new Error('oops: ' + type); // todo: remove check
  return result;
};

// export const parseDate = (fullStr: string) => {
//   const [fullDate] = fullStr.split('.');
//   const [dateStr, timeStr] = fullDate.split('T');
//   const [year, month, day] = dateStr.split('-');
//   const [hourStr, minuteStr, secondStr] = timeStr.split(':');

//   const dt = new Date();
//   dt.setUTCFullYear(Number(year));
//   dt.setUTCMonth(Number(month) - 1);
//   dt.setUTCDate(Number(day));
//   dt.setUTCHours(Number(hourStr));
//   dt.setUTCMinutes(Number(minuteStr));
//   dt.setUTCSeconds(Number(secondStr));

//   return dt.getTime();
// };

// export const getBlockTimestamp = (block?: { timestamp: string }) =>
//   block
//     ? new Date(parseDate(block.timestamp.replace(/\.000|\.500/, 'Z')))
//     : new Date();

export const log = (...args) =>
  console.log(`process:${process.pid} | `, ...args);
