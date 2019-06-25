import { parseLinks } from './textUtils';

jest.mock('./modules/globby');
jest.mock('./modules/search');
jest.mock('./modules/vscode');

test('parseLink', () => {
  expect(parseLinks({source: 'test /link.md parsing'})).toMatchObject([{path: '/link.md'}]);
  expect(parseLinks({source: 'test ../link.md parsing'})).toMatchObject([{path: '../link.md'}]);
  expect(parseLinks({source: 'test ./link.md parsing'})).toMatchObject([{path: './link.md'}]);
  expect(parseLinks({source: 'test ../test/dir/link.md parsing'})).toMatchObject([{path: '../test/dir/link.md'}]);
  expect(parseLinks({source: 'test http://link.md parsing'})).toMatchObject([]);
});
