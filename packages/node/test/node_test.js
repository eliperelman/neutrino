import test from 'ava';
import { validate } from 'webpack';
import Neutrino from '../../neutrino/Neutrino';

const mw = () => require('..');
const expectedExtensions = ['.js', '.jsx', '.vue', '.ts', '.tsx', '.mjs', '.json'];
const originalNodeEnv = process.env.NODE_ENV;

test.afterEach(() => {
  // Restore the original NODE_ENV after each test (which Ava defaults to 'test').
  process.env.NODE_ENV = originalNodeEnv;
});

test('loads preset', t => {
  t.notThrows(mw);
});

test('uses preset', t => {
  const api = new Neutrino();

  t.notThrows(() => api.use(mw()));
});

test('uses preset with custom main', t => {
  const api = new Neutrino({ mains: { server: 'server' } });

  t.notThrows(() => api.use(mw()));
  t.true(api.config.entryPoints.has('server'));
});

test('valid preset production', t => {
  process.env.NODE_ENV = 'production';
  const api = new Neutrino();
  api.use(mw());
  const config = api.config.toConfig();

  // Common
  t.is(config.target, 'node');
  t.deepEqual(config.resolve.extensions, expectedExtensions);
  t.is(config.optimization, undefined);
  t.is(config.devServer, undefined);

  // NODE_ENV/command specific
  t.is(config.devtool, 'source-map');

  const errors = validate(config);
  t.is(errors.length, 0);
});

test('valid preset development', t => {
  process.env.NODE_ENV = 'development';
  const api = new Neutrino();
  api.use(mw());
  const config = api.config.toConfig();

  // Common
  t.is(config.target, 'node');
  t.deepEqual(config.resolve.extensions, expectedExtensions);
  t.is(config.optimization, undefined);
  t.is(config.devServer, undefined);

  // NODE_ENV/command specific
  t.is(config.devtool, 'inline-sourcemap');

  const errors = validate(config);
  t.is(errors.length, 0);
});
