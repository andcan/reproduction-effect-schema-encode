import * as Either from '@effect/data/Either';
import { pipe } from '@effect/data/Function';
import * as S from '@effect/schema/Schema';
import { formatErrors } from '@effect/schema/TreeFormatter';
import { Temporal } from '@js-temporal/polyfill';
import { describe, it, expect } from 'vitest';
import {
  FromXson,
  InstantFromSelf,
  InstantFromString,
  PlainDateFromSelf,
  PlainDateFromString,
  Xson,
  instantPretty,
  plainDatePretty,
} from './xson';

function expectFail<E, A>(result: Either.Either<E, A>): asserts result is Either.Left<E, A> {
  expect(result._tag).toBe('Left');
}

describe('PlainDateFromSelf Schema', () => {
  it('should parse a valid plain date', () => {
    const result = pipe(Temporal.PlainDate.from('2022-01-03'), S.parseSync(PlainDateFromSelf));
    expect(result).toBeInstanceOf(Temporal.PlainDate);
    expect(result.year).toBe(2022);
    expect(result.month).toBe(1);
    expect(result.day).toBe(3);
  });
  it('should fail on non plain date', () => {
    const result = pipe(
      Temporal.Instant.from('2022-01-03T05:28:11.284Z'),
      S.parseEither(PlainDateFromSelf),
    );
    expectFail(result);
    expect(formatErrors(result.left.errors)).toMatchSnapshot();
  });
  it('should return a string representation of Temporal.PlainDate', () => {
    const date = new Temporal.PlainDate(2022, 1, 1);
    const prettyDate = plainDatePretty()(date);
    expect(prettyDate).toBe('Temporal.PlainDate.from("2022-01-01")');
  });
});

describe('PlainDateFromString Schema', () => {
  it('should parse a valid date string', () => {
    const result = pipe('2022-01-03', S.parseSync(PlainDateFromString));
    expect(result).toBeInstanceOf(Temporal.PlainDate);
    expect(result.year).toBe(2022);
    expect(result.month).toBe(1);
    expect(result.day).toBe(3);
  });
  it('should fail to parse an invalid date string', () => {
    const result = pipe('invalid-date', S.parseEither(PlainDateFromString));
    expectFail(result);
    expect(formatErrors(result.left.errors)).toMatchSnapshot();
  });
  it('should encode plain date to a valid date string', () => {
    const result = pipe(Temporal.PlainDate.from('2022-01-03'), S.encodeSync(PlainDateFromString));
    expect(result).toBe('2022-01-03');
  });
});

describe('InstantFromSelf Schema', () => {
  it('should parse a valid instant', () => {
    const result = pipe(
      Temporal.Instant.from('2022-01-03T05:28:11.284Z'),
      S.parseSync(InstantFromSelf),
    );
    expect(result).toBeInstanceOf(Temporal.Instant);
    const dateTime = result.toZonedDateTimeISO('UTC');
    expect(dateTime.year).toBe(2022);
    expect(dateTime.month).toBe(1);
    expect(dateTime.day).toBe(3);
    expect(dateTime.hour).toBe(5);
    expect(dateTime.minute).toBe(28);
    expect(dateTime.second).toBe(11);
    expect(dateTime.millisecond).toBe(284);
  });
  it('should fail on non instant', () => {
    const result = pipe(Temporal.PlainDate.from('2022-01-03'), S.parseEither(InstantFromSelf));
    expectFail(result);
    expect(formatErrors(result.left.errors)).toMatchSnapshot();
  });
  it('should return a string representation of Temporal.Instant', () => {
    const instant = Temporal.Instant.from('2022-01-03T05:28:11.284Z');
    const prettyInstant = instantPretty()(instant);
    expect(prettyInstant).toBe('Temporal.Instant.from("2022-01-03T05:28:11.284Z")');
  });
});

describe('InstantFromString Schema', () => {
  it('should parse a valid instant string', () => {
    const result = pipe('2022-01-03T05:28:11.284Z', S.parseSync(InstantFromString));
    expect(result).toBeInstanceOf(Temporal.Instant);
    const dateTime = result.toZonedDateTimeISO('UTC');
    expect(dateTime.year).toBe(2022);
    expect(dateTime.month).toBe(1);
    expect(dateTime.day).toBe(3);
    expect(dateTime.hour).toBe(5);
    expect(dateTime.minute).toBe(28);
    expect(dateTime.second).toBe(11);
    expect(dateTime.millisecond).toBe(284);
  });
  it('should fail to parse an invalid instant string', () => {
    const result = pipe('invalid-instant', S.parseEither(InstantFromString));
    expectFail(result);
    expect(formatErrors(result.left.errors)).toMatchSnapshot();
  });
  it('should encode instant to  to a valid date time string', () => {
    const result = pipe(
      Temporal.Instant.from('2022-01-03T05:28:11.284Z'),
      S.encodeSync(InstantFromString),
    );
    expect(result).toBe('2022-01-03T05:28:11.284Z');
  });
});

describe('Xson Schema', () => {
  const fromXson: FromXson = {
    date: '2022-01-01',
    instant: '2022-01-01T00:00Z',
    number: 1,
    boolean: true,
    null: null,
    string: 'string',
    array: [
      {
        number: 2,
        boolean: true,
        null: null,
        string: 'string',
      },
      {
        number: 3,
        boolean: true,
        null: null,
        string: 'string',
      },
    ],
    object: {
      number: 1,
      boolean: true,
      null: null,
      string: 'string',
    },
  };

  const xson: Xson = {
    date: new Temporal.PlainDate(2022, 1, 1),
    instant: Temporal.Instant.from('2022-01-01T00:00Z'),
    number: 1,
    boolean: true,
    null: null,
    string: 'string',
    array: [
      {
        number: 2,
        boolean: true,
        null: null,
        string: 'string',
      },
      {
        number: 3,
        boolean: true,
        null: null,
        string: 'string',
      },
    ],
    object: {
      number: 1,
      boolean: true,
      null: null,
      string: 'string',
    },
  };

  it('should parse a valid xson', () => {
    const result = pipe(fromXson, S.parseSync(Xson));
    expect(result).toMatchObject(xson);
  });

  it('should encode valid xson', () => {
    const result = S.encodeSync(Xson)(xson);
    expect(result).toMatchObject(fromXson);
  });
});
