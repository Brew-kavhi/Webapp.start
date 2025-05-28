# CoffeeApi

All URIs are relative to *http://undefined:8000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createCoffee**](#createcoffee) | **POST** /Coffee | Create a new instance of Coffee|
|[**deleteCoffee**](#deletecoffee) | **DELETE** /Coffee/{id} | Deletes a Coffee|
|[**getCoffee**](#getcoffee) | **GET** /Coffee/{id} | Get instance of Coffee|
|[**listCoffee**](#listcoffee) | **GET** /Coffee | Get all instances of Coffee|
|[**updateCoffee**](#updatecoffee) | **PUT** /Coffee/{id} | Update instance of Coffee|

# **createCoffee**
> Coffee createCoffee()


### Example

```typescript
import {
    CoffeeApi,
    Configuration,
    NewCoffeeRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CoffeeApi(configuration);

let newCoffeeRequest: NewCoffeeRequest; // (optional)

const { status, data } = await apiInstance.createCoffee(
    newCoffeeRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **newCoffeeRequest** | **NewCoffeeRequest**|  | |


### Return type

**Coffee**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Instance of Coffee created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteCoffee**
> deleteCoffee()


### Example

```typescript
import {
    CoffeeApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CoffeeApi(configuration);

let id: number; //Coffee id (default to undefined)

const { status, data } = await apiInstance.deleteCoffee(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Coffee id | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**400** | Invalid value |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCoffee**
> CoffeeResponse getCoffee()

Get instance of Coffee by id

### Example

```typescript
import {
    CoffeeApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CoffeeApi(configuration);

let id: number; //User ID (default to undefined)

const { status, data } = await apiInstance.getCoffee(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | User ID | defaults to undefined|


### Return type

**CoffeeResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | One instances of Coffee |  -  |
|**400** | Invalid ID supplied |  -  |
|**401** | Coffee not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listCoffee**
> Array<CoffeeResponse> listCoffee()


### Example

```typescript
import {
    CoffeeApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CoffeeApi(configuration);

const { status, data } = await apiInstance.listCoffee();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<CoffeeResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of instances of Coffee |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateCoffee**
> CoffeeResponse updateCoffee()


### Example

```typescript
import {
    CoffeeApi,
    Configuration,
    UpdateCoffeeRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new CoffeeApi(configuration);

let id: number; //User ID (default to undefined)
let updateCoffeeRequest: UpdateCoffeeRequest; //Update a user (optional)

const { status, data } = await apiInstance.updateCoffee(
    id,
    updateCoffeeRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateCoffeeRequest** | **UpdateCoffeeRequest**| Update a user | |
| **id** | [**number**] | User ID | defaults to undefined|


### Return type

**CoffeeResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | One instances of Coffee |  -  |
|**400** | Invalid Input |  -  |
|**422** | Validation exception |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

