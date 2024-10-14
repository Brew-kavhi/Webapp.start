#!/bin/bash

# Prompt the user for the folder name
read -p "Enter the folder name for the component: " folderName

# Check if the input is empty
if [ -z "$folderName" ]; then
    echo "Folder name cannot be empty."
    exit 1
fi

read -p "Enter the component name for the component: " componentName

# Check if the input is empty
if [ -z "$componentName" ]; then
    echo "Component name cannot be empty."
    exit 1
fi

read -p "Enter the tag name for the component: " tagName

# Check if the input is empty
if [ -z "$tagName" ]; then
    echo "Tag name cannot be empty."
    exit 1
fi
# Define the directory path
directoryPath="./components/$folderName"

# Create the directory if it doesn't exist
if [ ! -d "$directoryPath" ]; then
    mkdir "$directoryPath"
fi

# Define the base component content
componentContent=$(cat <<EOF
/* This is the $componentName Component
 * This code is part of the frontend.
 *
 * Author: 
 * Website: 
 * E-Mail: 
 *
 * Version: 0.0.1
 * License: MIT
 * Copyright 
 */
class $componentName extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = 'In am a $componentName component';
	}
}
customElements.define('$tagName', $componentName);
EOF
)

# Write the component file
echo "$componentContent" > "$directoryPath/$componentName.js"

echo "Component $folderName created successfully in $directoryPath"

