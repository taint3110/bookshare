/* eslint-disable @typescript-eslint/no-explicit-any */
import {AuthenticationComponent} from '@loopback/authentication';
import {SECURITY_SCHEME_SPEC} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {MigrationBindings, MigrationComponent} from 'loopback4-migration';
import path from 'path';
import {MyJWTAuthenticationComponent} from './components/jwt-authentication';
import {MySequence} from './sequence';

export {ApplicationConfig};

export class BookshareApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    if (process.env?.IS_MIGRATING_SERVER) {
      this.component(MigrationComponent);
    }

    this.component(AuthenticationComponent);
    this.component(MyJWTAuthenticationComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.addSecuritySpec();
  }

  setupBindings() {
    this.bind(MigrationBindings.CONFIG).to({
      appVersion: '1.0.0', // !NOTE: Use this option to replace the app version in package.json
      dataSourceName: 'mongodb',
    });
  }

  addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'Bookshare Application',
        version: '1.0.0',
      },
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      security: [
        {
          // secure all endpoints with 'jwt'
          jwt: [],
        },
      ],
      servers: [{url: '/'}],
    });
  }
}
