import * as AST from '@effect/schema/AST';
import * as Arbitrary from '@effect/schema/Arbitrary';
import * as PR from '@effect/schema/ParseResult';
import * as Pretty from '@effect/schema/Pretty';
import * as S from '@effect/schema/Schema';
import { Temporal, toTemporalInstant } from '@js-temporal/polyfill';

const _null: S.Schema<null> = S.make(AST.createLiteral(null));

export const plainDateArbitrary = (): Arbitrary.Arbitrary<Temporal.PlainDate> => fc =>
  fc
    .date()
    .map(date => new Temporal.PlainDate(date.getFullYear(), date.getMonth() + 1, date.getDate()));

export const plainDatePretty = (): Pretty.Pretty<Temporal.PlainDate> => date =>
  `Temporal.PlainDate.from(${JSON.stringify(date)})`;

export const PlainDateFromSelf: S.Schema<Temporal.PlainDate> = S.declare(
  [],
  S.struct({}),
  () => u =>
    u instanceof Temporal.PlainDate ? PR.success(u) : PR.failure(PR.type(PlainDateFromSelf.ast, u)),
  {
    [AST.IdentifierAnnotationId]: 'Temporal.PlainDate',
    [Arbitrary.ArbitraryHookId]: plainDateArbitrary,
    [Pretty.PrettyHookId]: plainDatePretty,
  },
);

export const plainDateFromString = <I, A extends string>(
  self: S.Schema<I, A>,
): S.Schema<I, Temporal.PlainDate> => {
  const schema: S.Schema<I, Temporal.PlainDate> = S.transformResult(
    self,
    PlainDateFromSelf,
    s => {
      try {
        return PR.success(Temporal.PlainDate.from(s));
      } catch (e) {
        return PR.failure(PR.type(PlainDateFromSelf.ast, s));
      }
    },
    d => PR.success(d.toString() as A),
  );
  return schema;
};

export const PlainDateFromString: S.Schema<string, Temporal.PlainDate> = plainDateFromString(
  S.string,
);

export const instantArbitrary = (): Arbitrary.Arbitrary<Temporal.Instant> => fc =>
  fc.date().map(date => toTemporalInstant.call(date));

export const instantPretty = (): Pretty.Pretty<Temporal.Instant> => instant =>
  `Temporal.Instant.from(${JSON.stringify(instant)})`;

export const InstantFromSelf: S.Schema<Temporal.Instant> = S.declare(
  [],
  S.struct({}),
  () => u =>
    u instanceof Temporal.Instant ? PR.success(u) : PR.failure(PR.type(InstantFromSelf.ast, u)),
  {
    [AST.IdentifierAnnotationId]: 'Temporal.Instant',
    [Arbitrary.ArbitraryHookId]: instantArbitrary,
    [Pretty.PrettyHookId]: instantPretty,
  },
);

export const instantFromString = <I, A extends string>(
  self: S.Schema<I, A>,
): S.Schema<I, Temporal.Instant> => {
  const schema: S.Schema<I, Temporal.Instant> = S.transformResult(
    self,
    InstantFromSelf,
    s => {
      try {
        return PR.success(Temporal.Instant.from(s));
      } catch (e) {
        return PR.failure(PR.type(InstantFromSelf.ast, s));
      }
    },
    i => PR.success(i.toString() as A),
  );
  return schema;
};

export const InstantFromString: S.Schema<string, Temporal.Instant> = instantFromString(S.string);

export type FromXsonArray = ReadonlyArray<FromXson>;

export type FromXsonObject = {
  [key: string]: FromXson;
};

export type FromXson =
  | undefined
  | null
  | boolean
  | number
  | string
  | FromXsonArray
  | FromXsonObject;

export type XsonArray = ReadonlyArray<Xson>;

export type XsonObject = {
  [key: string]: Xson;
};

export type Xson =
  | undefined
  | null
  | boolean
  | number
  | string
  | Temporal.PlainDate
  | Temporal.Instant
  | XsonArray
  | XsonObject;

export const Xson: S.Schema<FromXson, Xson> = S.lazy(
  () =>
    S.union(
      S.undefined,
      _null,
      S.JsonNumber,
      S.boolean,
      PlainDateFromString,
      InstantFromString,
      S.string,
      S.array(Xson),
      S.record(S.string, Xson),
    ),
  {},
);

export const XsonArray: S.Schema<FromXsonArray, XsonArray> = S.lazy(() => S.array(Xson));

export const XsonObject: S.Schema<FromXsonObject, XsonObject> = S.lazy(() =>
  S.record(S.string, Xson),
);
