import { AxiosInstance, AxiosPromise, RawAxiosRequestConfig } from 'axios';
import type { Configuration } from './configuration';
import { RequestArgs, BASE_PATH, operationServerMap, BaseAPI } from './base';
import { USER_API_HOST } from '../js/const/host';
import { createRequestFunction, serializeDataIfNeeded, setSearchParams, toPathString } from './common';
import globalAxios from 'axios';

export interface NewUserRequest {
    /**
     * 
     * @type {string}
     * @memberof User
     */
    'name'?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    'lastName'?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    'email'?: string;
    /**
     * 
     * @type {password}
     * @memberof User
     */
    'password'?: string;
}
export interface DeleteUserRequest {
    /**
     * 
     * @type {string}
     * @memberof DeleteUserRequest
     */
    'password': string;
}
export interface DisableTwoFARequest {
    /**
     * 
     * @type {string}
     * @memberof DisableTwoFARequest
     */
    'password': string;
}
export class User {
    /**
     * 
     * @type {string}
     * @memberof User
     */
    'name'?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     */
    'lastName'?: string;
    /**
     * 
     * @type {string}
     * @memberof User
     * 'displayName'?: string;
     */
    /**
     * 
     * @type {string}
     * @memberof User
     */
    'email'?: string;
    /**
     * 
     * @type {password}
     * @memberof User
     */
    'password'?: string;
    /**
     * 
     * @type {password}
     * @memberof User
     */
    '2faenabled'?: boolean;
}

export const UserParamsCreator = function(configuration?: Configuration) {
        let baseOptions;
        if (configuration) {
            baseOptions = configuration.baseOptions;
        }
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            localVarHeaderParameter['Content-Type'] = 'application/json';
    return {
        createUser: async (user?: User, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = '/user/new';
            const localVarUrlObj = new URL(localVarPath, USER_API_HOST);
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};


            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(user, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions
            };
        },
        deleteUser: async (deleteUserReq?: DeleteUserRequest, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = '/user/delete';
            const localVarUrlObj = new URL(localVarPath, USER_API_HOST);
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(deleteUserReq, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions
            };
        },
        getUser: async (options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = '/user/get';
            const localVarUrlObj = new URL(localVarPath, USER_API_HOST);
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded({}, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions
            };
        },
        updateUser: async (user?: User, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = '/user/update';
            const localVarUrlObj = new URL(localVarPath, USER_API_HOST);
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(user, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions
            };
        },
        disableTwoFA: async (req?: DisableTwoFARequest, options: RawAxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = '/user/disabletwofactor';
            const localVarUrlObj = new URL(localVarPath, USER_API_HOST);
            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(req, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions
            };
        },
    }
}

export const UserAPIFp = function(configuration?: Configuration) {
    const userAxiosParamCreator = UserParamsCreator(configuration)
    return {
        async createUser(user?: User, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<User>> {
            const userAxiosArgs = await userAxiosParamCreator.createUser(user, options);
            const userOperationServerIndex = configuration?.serverIndex ?? 0;
            const userOperationServerBasePath = operationServerMap['DefaultApi.createUser']?.[userOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(userAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, userOperationServerBasePath || basePath);
        },
        async deleteUser(deleteUserReq?: DeleteUserRequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<User>> {
            const userAxiosArgs = await userAxiosParamCreator.deleteUser(deleteUserReq, options);
            const userOperationServerIndex = configuration?.serverIndex ?? 0;
            const userOperationServerBasePath = operationServerMap['DefaultApi.deleteUser']?.[userOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(userAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, userOperationServerBasePath || basePath);
        },
        async getUser(options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<User>> {
            const userAxiosArgs = await userAxiosParamCreator.getUser(options);
            const userOperationServerIndex = configuration?.serverIndex ?? 0;
            const userOperationServerBasePath = operationServerMap['DefaultApi.getUser']?.[userOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(userAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, userOperationServerBasePath || basePath);
        },
        async updateUser(user?: User, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<User>> {
            const userAxiosArgs = await userAxiosParamCreator.updateUser(user, options);
            const userOperationServerIndex = configuration?.serverIndex ?? 0;
            const userOperationServerBasePath = operationServerMap['DefaultApi.updateUser']?.[userOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(userAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, userOperationServerBasePath || basePath);
        },
        async disableTwoFA(req?: DisableTwoFARequest, options?: RawAxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<User>> {
            const userAxiosArgs = await userAxiosParamCreator.disableTwoFA(req, options);
            const userOperationServerIndex = configuration?.serverIndex ?? 0;
            const userOperationServerBasePath = operationServerMap['DefaultApi.disableTwoFA']?.[userOperationServerIndex]?.url;
            return (axios, basePath) => createRequestFunction(userAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, userOperationServerBasePath || basePath);
        }
    };
}

export const UserAPIFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const userFp = UserAPIFp(configuration);
    return {
        createUser(user?: User, options?: RawAxiosRequestConfig): AxiosPromise<User> {
            return userFp.createUser(user, options).then((request) => request(axios, basePath));
        },
        deleteUser(deleteUserReq?: DeleteUserRequest, options?: RawAxiosRequestConfig): AxiosPromise<User> {
            return userFp.deleteUser(deleteUserReq, options).then((request) => request(axios, basePath));
        },
        getUser(ptions?: RawAxiosRequestConfig): AxiosPromise<User> {
            return userFp.getUser(options).then((request) => request(axios, basePath));
        },
        updateUser(user?: User, options?: RawAxiosRequestConfig): AxiosPromise<User> {
            return userFp.updateUser(user, options).then((request) => request(axios, basePath));
        },
        disableTwoFA(req?: DisableTwoFARequest, options?: RawAxiosRequestConfig): AxiosPromise<User> {
            return userFp.updateUser(req, options).then((request) => request(axios, basePath));
        },
    }
};

export class UserAPI extends BaseAPI {
    /**
     * 
     * @summary Create a new instance of User
     * @param {user} [User] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserAPI
     */
    public createUser(user?: User, options?: RawAxiosRequestConfig) {
        return UserAPIFp(this.configuration).createUser(user,options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary Deletes a user
     * @param {deleteUserReq} [DeleteUserRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserAPI
     */
    public deleteUser(deleteUserReq?: DeleteUserRequest, options?: RawAxiosRequestConfig) {
        return UserAPIFp(this.configuration).deleteUser(deleteUserReq,options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary get a users information
     * @param {user} [user] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserAPI
     */
    public getUser(options?: RawAxiosRequestConfig) {
        return UserAPIFp(this.configuration).getUser(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary update a users information
     * @param {user} [user] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserAPI
     */
    public updateUser(user?: User, options?: RawAxiosRequestConfig) {
        return UserAPIFp(this.configuration).updateUser(user,options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * 
     * @summary disables the two factor authentication
     * @param {req} [DisableTwoFARequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof UserAPI
     */
    public disableTwoFA(req?: DisableTwoFARequest, options?: RawAxiosRequestConfig) {
        return UserAPIFp(this.configuration).disableTwoFA(req,options).then((request) => request(this.axios, this.basePath));
    }
}
