import { parseLinks } from './textUtils';

jest.mock('./modules/globby');

test('parseLink', () => {
  expect(parseLinks({source: 'test /link.md parsing'})).toMatchObject([{path: '/link.md'}]);
  expect(parseLinks({source: 'test ../link.md parsing'})).toMatchObject([{path: '../link.md'}]);
  expect(parseLinks({source: 'test ./link.md parsing'})).toMatchObject([{path: './link.md'}]);
  expect(parseLinks({source: 'test http://link.md parsing'})).toMatchObject([]);
});
