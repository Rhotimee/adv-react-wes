import formatMoney from '../lib/formatMoney';


describe('formatMoney function', () => {
  it('works with fractional dollars', () => {
    expect(formatMoney(1)).toEqual('$0.01');
  });

  it('leaves centes off for whole dollars', () => {
    expect(formatMoney(5000)).toEqual('$50');
    expect(formatMoney(100)).toEqual('$1');
  })
  it('works with whole and fractional dollars', () => {
    expect(formatMoney(5012)).toEqual('$50.12');
    expect(formatMoney(101)).toEqual('$1.01');
    expect(formatMoney(104567890231)).toEqual('$1,045,678,902.31');

  })
})