# SensorsApi

All URIs are relative to *http://undefined:8000*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSensors**](#createsensors) | **POST** /Sensors | Create a new instance of Sensors|
|[**deleteSensors**](#deletesensors) | **DELETE** /Sensors/{id} | Deletes a Sensors|
|[**getSensors**](#getsensors) | **GET** /Sensors/{id} | Get instance of Sensors|
|[**listSensors**](#listsensors) | **GET** /Sensors | Get all instances of Sensors|
|[**updateSensors**](#updatesensors) | **PUT** /Sensors/{id} | Update instance of Sensors|

# **createSensors**
> Sensors createSensors()


### Example

```typescript
import {
    SensorsApi,
    Configuration,
    NewSensorsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SensorsApi(configuration);

let newSensorsRequest: NewSensorsRequest; // (optional)

const { status, data } = await apiInstance.createSensors(
    newSensorsRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **newSensorsRequest** | **NewSensorsRequest**|  | |


### Return type

**Sensors**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Instance of Sensors created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteSensors**
> deleteSensors()


### Example

```typescript
import {
    SensorsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SensorsApi(configuration);

let id: number; //Sensors id (default to undefined)

const { status, data } = await apiInstance.deleteSensors(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | Sensors id | defaults to undefined|


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

# **getSensors**
> SensorsResponse getSensors()

Get instance of Sensors by id

### Example

```typescript
import {
    SensorsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SensorsApi(configuration);

let id: number; //User ID (default to undefined)

const { status, data } = await apiInstance.getSensors(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] | User ID | defaults to undefined|


### Return type

**SensorsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | One instances of Sensors |  -  |
|**400** | Invalid ID supplied |  -  |
|**401** | Sensors not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listSensors**
> Array<SensorsResponse> listSensors()


### Example

```typescript
import {
    SensorsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SensorsApi(configuration);

const { status, data } = await apiInstance.listSensors();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<SensorsResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A list of instances of Sensors |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateSensors**
> SensorsResponse updateSensors()


### Example

```typescript
import {
    SensorsApi,
    Configuration,
    UpdateSensorsRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new SensorsApi(configuration);

let id: number; //User ID (default to undefined)
let updateSensorsRequest: UpdateSensorsRequest; //Update a user (optional)

const { status, data } = await apiInstance.updateSensors(
    id,
    updateSensorsRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateSensorsRequest** | **UpdateSensorsRequest**| Update a user | |
| **id** | [**number**] | User ID | defaults to undefined|


### Return type

**SensorsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | One instances of Sensors |  -  |
|**400** | Invalid Input |  -  |
|**422** | Validation exception |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

