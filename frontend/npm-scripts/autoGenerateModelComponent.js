const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Get the model name from the command line arguments
const serviceName = process.argv[2];
if (!serviceName) {
	console.error("Please provide a component name, e.g., 'User'");
	process.exit(1);
}

// Paths to the OpenAPI schema and output folder
const schemaPath = `../services/${serviceName}/api_scheme.yaml`;
const outputDir = `./components/${serviceName}`;

// Load and parse the OpenAPI schema
const schema = yaml.load(fs.readFileSync(schemaPath, 'utf8'));

// Utility function to capitalize field names for display
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

function evaluateExpressions(str, context = {}) {
	context['capitalize'] = capitalize;
	let result = '';
	let stack = [];
	let exprStart = -1;

	for (let i = 0; i < str.length; i++) {
		if (str[i] === '$' && str[i + 1] === '{') {
			// Start of a new `${` expression
			if (stack.length === 0) exprStart = i;
			stack.push(i);
			i++; // Skip the '{'
		} else if (str[i] === '{' && exprStart !== -1) {
			stack.push(i);
		} else if (str[i] === '}' && stack.length > 0) {
			// End of the current `${...}` expression
			stack.pop();
			if (stack.length === 0 && exprStart !== -1) {
				// Outer expression found
				const expression = str.slice(exprStart + 2, i); // Get expression within `${}`
				let evaluated;
				try {
					console.log(expression);
					const func = new Function(
						...Object.keys(context),
						`return ${expression};`
					);
					evaluated = func(...Object.values(context));
				} catch (error) {
					evaluated = `<error: ${error.message}>`;
				}
				result += evaluated;
				exprStart = -1; // Reset the start index
			}
		} else if (stack.length === 0) {
			// Add to result only if not within an expression
			result += str[i];
		}
	}

	return result;
}

// Function to generate a web component for each model
function generateDetailsComponent(modelName, fields) {
	const className = capitalize(modelName);

	const componentCode = evaluateExpressions(
		fs.readFileSync(
			path.join(
				__dirname,
				'../../.ressources/templates/frontend/components/Details.ts'
			),
			{ encoding: 'utf-8' }
		),
		{
			className: className,
			modelName: modelName,
			fields: fields,
			serviceName: serviceName,
		}
	);
	const componentHTML = evaluateExpressions(
		fs.readFileSync(
			path.join(
				__dirname,
				'../../.ressources/templates/frontend/html/Details.html'
			),
			{ encoding: 'utf-8' }
		),
		{
			className: className,
			modelName: modelName,
			fields: fields,
			serviceName: serviceName,
		}
	);

	// Write the component code to a file
	fs.writeFileSync(`${outputDir}/${className}Detail.ts`, componentCode);
	fs.writeFileSync(`${outputDir}/${className}Detail.html`, componentHTML);
	console.log(`Generated ${modelName}Component.ts`);
}

function generateFormComponent(modelName, fields) {
	const className = capitalize(modelName);
	const componentCode = evaluateExpressions(
		fs.readFileSync(
			path.join(
				__dirname,
				'../../.ressources/templates/frontend/components/Form.ts'
			),
			{ encoding: 'utf-8' }
		),
		{
			className: className,
			modelName: modelName,
			fields: fields,
			serviceName: serviceName,
		}
	);
	const componentHTML = evaluateExpressions(
		fs.readFileSync(
			path.join(__dirname, '../../.ressources/templates/frontend/html/Form.html'),
			{ encoding: 'utf-8' }
		),
		{
			className: className,
			modelName: modelName,
			fields: fields,
			serviceName: serviceName,
		}
	);
	// Write the component code to a file
	fs.writeFileSync(`${outputDir}/${className}Form.ts`, componentCode);
	fs.writeFileSync(`${outputDir}/${className}Form.html`, componentHTML);
	console.log(`Generated ${modelName}Form.ts`);
}

function generateListComponent(modelName, fields) {
	const className = capitalize(modelName);

	const listComponentCode = evaluateExpressions(
		fs.readFileSync(
			path.join(
				__dirname,
				'../../.ressources/templates/frontend/components/List.ts'
			),
			{ encoding: 'utf-8' }
		),
		{
			className: className,
			modelName: modelName,
			fields: fields,
			serviceName: serviceName,
		}
	);
	const listComponentHTML = evaluateExpressions(
		fs.readFileSync(
			path.join(__dirname, '../../.ressources/templates/frontend/html/List.html'),
			{ encoding: 'utf-8' }
		),
		{
			className: className,
			modelName: modelName,
			fields: fields,
			serviceName: serviceName,
		}
	);
	// write the card component to a file

	// Write the component code to a file
	fs.writeFileSync(`${outputDir}/${className}List.ts`, listComponentCode);
	fs.writeFileSync(`${outputDir}/${className}List.html`, listComponentHTML);
	console.log(`Generated ${modelName}List.ts`);
}

function generateCardComponent(modelName, fields) {
	const className = capitalize(modelName);
	const cardComponentCode = evaluateExpressions(
		fs.readFileSync(
			path.join(
				__dirname,
				'../../.ressources/templates/frontend/components/Card.ts'
			),
			{ encoding: 'utf-8' }
		),
		{
			className: className,
			modelName: modelName,
			fields: fields,
			serviceName: serviceName,
		}
	);
	const cardComponentHTML = evaluateExpressions(
		fs.readFileSync(
			path.join(__dirname, '../../.ressources/templates/frontend/html/Card.html'),
			{ encoding: 'utf-8' }
		),
		{
			className: className,
			modelName: modelName,
			fields: fields,
			serviceName: serviceName,
		}
	);
	// write the card component to a file
	fs.writeFileSync(`${outputDir}/${className}Card.ts`, cardComponentCode);
	fs.writeFileSync(`${outputDir}/${className}Card.html`, cardComponentHTML);
	console.log(`Generated ${modelName}Card.ts`);
}

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}

// Generate components based on each schema definition
const models = schema.components.schemas;
const model = models[capitalize(serviceName)];
const properties = model.properties;
const fields = Object.keys(properties).map((prop) => ({
	name: prop,
	type: properties[prop].type,
}));

generateDetailsComponent(serviceName, fields);
generateListComponent(serviceName, fields);
generateCardComponent(serviceName, fields);
generateFormComponent(serviceName, fields);