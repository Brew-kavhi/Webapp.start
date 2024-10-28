require('dotenv').config({ path: '../.env' });

const fs = require('fs');
const yaml = require('js-yaml');

// Initialize base structure for the merged OpenAPI spec
let mergedOpenApi = {
	openapi: '3.0.0',
	info: {
		title: 'Merged API',
		version: '1.0.0',
	},
	servers: [],
	paths: {},
	components: {},
};

// Kong config structure
let kongConfig = {
	_format_version: '2.1',
	services: [],
};

// Function to merge components
const mergeComponents = (target, source) => {
	for (let [key, value] of Object.entries(source)) {
		if (!target[key]) {
			target[key] = value;
		} else {
			target[key] = { ...target[key], ...value };
		}
	}
};

const getAPISchemes = (folder) => {
	return fs
		.readdirSync(folder, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.filter((dirent) => dirent.name !== 'user')
		.map((dirent) => `${folder}/${dirent.name}/api_scheme.yaml`);
};
let hostNames = [];

// Function to process and merge OpenAPI specs
const processOpenApiFile = (filePath) => {
	const openApiSpec = yaml.load(fs.readFileSync(filePath, 'utf8'));

	// Extract service details
	const serviceName = openApiSpec.info.title.toLowerCase().replace(/\s+/g, '-');
	const serviceUrl = openApiSpec.servers[0].url; // Assuming a base URL is defined
	const paths = openApiSpec.paths;

	// Add service to Kong config
	let service = {
		name: serviceName,
		url: serviceUrl,
		routes: [],
	};

	Object.keys(paths).forEach((path) => {
		// Merge the paths into the merged OpenAPI spec
		if (!mergedOpenApi.paths[path]) {
			mergedOpenApi.paths[path] = {};
		}

		let tag = '';
		// Copy methods (GET, POST, etc.) for each path
		Object.keys(paths[path]).forEach((method) => {
			mergedOpenApi.paths[path][method] = paths[path][method];
			if ('tags' in paths[path][method]) {
				tag = paths[path][method]['tags'][0];
			}
		});
		// Add each path as a route for Kong
		if (service.routes.filter((route) => route.name == serviceName).length == 0) {
			service.routes.push({
				name: serviceName,
				paths: [`/api/${tag}`],
				strip_path: true,
			});
			hostNames.push({
				name: `${tag}_API_HOST`,
				url: `${process.env.APP_URL}/api/${tag}`,
			});
		}
	});

	// Add components (schemas, responses, parameters, etc.)
	if (openApiSpec.components) {
		mergeComponents(mergedOpenApi.components, openApiSpec.components);
	}

	kongConfig.services.push(service);
};

let kongPort = 8000;
if (process.env.KONG_PORT) {
	kongPort = process.env.KONG_PORT;
}
mergedOpenApi.servers.push({ url: `${process.env.KONG_HOST}:${kongPort}` });
const openApiFiles = getAPISchemes('../services');

// Process each OpenAPI file
openApiFiles.forEach(processOpenApiFile);
kongConfig.services.push({
	name: 'user-api',
	url: `${process.env.SERVICES_HOST}:10001`,
	routes: [
		{
			name: 'user-route',
			paths: ['/api/user'],
			strip_path: true,
		},
	],
});
hostNames.push({
	name: `USER_API_HOST`,
	url: `${process.env.APP_URL}/api/user`,
});
kongConfig.services.push({
	name: 'frontend',
	url: `${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}`,
	routes: [
		{
			name: 'frontend-route',
			paths: ['/'],
			strip_path: false,
		},
	],
});

// Write the kong.yaml file
fs.writeFileSync('../services/kong.yaml', yaml.dump(kongConfig), 'utf8');
fs.writeFileSync(
	'js/const/host.ts',
	hostNames
		.map((host) => `export const ${host.name} = '${host.url}';`)
		.join('\n'),
	'utf8'
);

// Write the merged OpenAPI spec
fs.writeFileSync(
	'client_api/merged-openapi.yaml',
	yaml.dump(mergedOpenApi),
	'utf8'
);

console.log('kong.yaml and merged-openapi.yaml files generated successfully.');
