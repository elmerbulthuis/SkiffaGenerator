import * as skiffaCore from "@skiffa/core";
import { itt } from "../../utils/iterable-text-template.js";
import {
  generateEndpointHandlerMethod,
  generateRegisterMiddlewareMethod,
  generateRequestHandlerMethod,
  registerAuthenticationHandlerMethod,
  registerAuthenticationHandlersMethod,
  registerOperationHandlerMethod,
  registerOperationHandlersMethod,
} from "../functions.js";
import {
  getAuthenticationHandlersTypeName,
  getOperationHandlersTypeName,
  getServerAuthenticationTypeName,
} from "../names.js";

/**
 * Generated the server class. This is the server that is generated from the
 * specification. It inherits from the `ServerBase` class in `@skiffa/lib`.
 *
 * The class sets up routing on instantiation, then it's up to the user to
 * register handlers for all operations via the `register...Operation` methods.
 * Also authentication handlers can be registered via `register...Authentication`
 * methods.
 *
 * The handle method redirects `ServerIncomingRequest` to the right route
 * handler. Then the route handler transforms this request into an operation
 * incoming request that the operation handler can take as input. This handler
 * is then executed with the route parameters and the operation incoming request
 * as arguments. The operation handler return an operation outgoing response
 * that is transformed into a `ServerOutgoingResponse` that is the return type
 * of the handle method.
 */
export function* generateServerClass(
  names: Record<string, string>,
  apiModel: skiffaCore.ApiContainer,
  requestTypes: Array<string>,
  responseTypes: Array<string>,
) {
  const authenticationTypeName = getServerAuthenticationTypeName();

  yield itt`
export class Server<A extends ${authenticationTypeName} = ${authenticationTypeName}>
  extends lib.ServerBase
{
  ${generateBody(names, apiModel, requestTypes, responseTypes)}
}
`;
}

function* generateBody(
  names: Record<string, string>,
  apiModel: skiffaCore.ApiContainer,
  requestTypes: Array<string>,
  responseTypes: Array<string>,
) {
  const authenticationHandlersTypeName = getAuthenticationHandlersTypeName();
  const operationHandlersTypeName = getOperationHandlersTypeName();

  yield itt`
  protected readonly authenticationHandlers: Partial<${authenticationHandlersTypeName}<A>> = {};
  protected readonly operationHandlers: Partial<${operationHandlersTypeName}<A>> = {};
`;

  yield itt`
    protected readonly configuration: ServerConfiguration;
    constructor(configuration: Partial<ServerConfiguration> = {}) {
      super();

      this.configuration = {
        ...defaultServerConfiguration,
        ...configuration,
      };
    }
  `;

  yield generateRegisterMiddlewareMethod();
  yield generateRequestHandlerMethod(apiModel);

  yield registerAuthenticationHandlersMethod(apiModel);
  yield registerOperationHandlersMethod(apiModel);

  for (const authenticationModel of apiModel.authentication) {
    yield registerAuthenticationHandlerMethod(authenticationModel);
  }

  for (const pathModel of apiModel.paths) {
    for (const operationModel of pathModel.operations) {
      yield registerOperationHandlerMethod(operationModel);
      yield generateEndpointHandlerMethod(
        names,
        apiModel,
        operationModel,
        requestTypes,
        responseTypes,
      );
    }
  }
}
