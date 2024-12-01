// Request permission to display notifications

import { coerceToArrayBuffer, coerceToBase64Url } from '/js/utils.js';

export function requestNotificationPermission() {
	if ('Notification' in window) {
		console.log(Notification.permission);
		Notification.requestPermission().then((permission) => {
			if (permission === 'granted') {
				console.log('Notification permission granted.');
			} else {
				console.log('Notification permission denied.');
			}
		});
	} else {
		console.log('This browser does not support notifications.');
	}
}

// Function to send a notification
export async function sendLocalNotification(
	title: string = 'Notification',
	body: string = 'New Message',
	icon: string = ''
) {
	let registration = undefined;
	if (!navigator.serviceWorker) {
		return;
		}
	if (!navigator.serviceWorker.getRegistration) {
		return;
	}
	if (!Navigation) {
		return;
	}
	const i = await navigator.serviceWorker.getRegistration();
	navigator.serviceWorker.getRegistration().then((response) => registration = response);
	if (Notification.permission === 'granted') {
		const payload = {
			body: body,
			icon: icon,
			tag: 'pwa-notification', // Prevents duplicate notifications
		};
		if (registration && 'showNotification' in registration) {
			registration.showNotification(title, payload);
		} else {
			new Notification(title, payload);
		}
	}
}

export async function share(
	title: string = 'Share',
	text: string = 'This is interesting'
) {
	if (navigator.share) {
		try {
			await navigator.share({
				title: title,
				text: text,
				url: window.location.href, // Current page URL
			});
			console.log('Content shared successfully');
		} catch (error) {
			console.error('Error sharing content:', error);
		}
	} else {
		toast.error('Web Share API not supported in this browser.');
	}
}

// Access the device's camera
async function startCamera(video: HTMLVideoElement) {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		video.srcObject = stream;
	} catch (err) {
		console.error('Error accessing camera: ', err);
	}
}

export function uploadCamera(
	video: HTMLVideoElement,
	canvas: HTMLCanvasElement,
	url: string
) {
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	context.drawImage(video, 0, 0, canvas.width, canvas.height);

	// Convert the captured image to a blob and upload to the server
	canvas.toBlob(async (blob) => {
		const formData = new FormData();
		formData.append('image', blob, 'photo.png');

		try {
			const response = await fetch(url, {
				method: 'POST',
				body: formData,
			});

			const result = await response.json();
			console.log('Image uploaded successfully:', result);
		} catch (err) {
			console.error('Error uploading image:', err);
		}
	}, 'image/png');
}

export async function registerUserBiometricCredentials(
	registerChallengeUrl: string = '/auth/register/challenge',
	registerUrl: string = '/auth/register',
) {
	// Request a registration challenge from the server
	const response = await fetch(`${registerChallengeUrl}`, {
		method: 'GET',
		withCredentials: true,
		headers: {
			'Content-Type': 'application/json',
		},
	});
	const resoptions = await response.json();
	const options = resoptions['publicKey'];

	// Start the credential creation process
	const publicKeyCredentialCreationOptions = {
		...options,
		challenge: coerceToArrayBuffer(options.challenge),
		user: {
			id: coerceToArrayBuffer(options.user.id),
			name: options.user.name,
			displayName: options.user.displayName,
		},
		pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
		authenticatorSelection: {
			authenticatorAttachment: 'platform', // To use FaceID/Fingerprint
			requireResidentKey: false,
			userVerification: 'required',
		},
	};

	try {
		const credential = await navigator.credentials.create({
			publicKey: publicKeyCredentialCreationOptions,
		});

		// Convert the credential to base64 to send to the server
		const credentialJSON = {
			id: credential.id,
			rawId: coerceToBase64Url(credential.rawId),
			response: {
				attestationObject: coerceToBase64Url(credential.response.attestationObject),
				clientDataJSON: coerceToBase64Url(credential.response.clientDataJSON),
			},
			type: credential.type,
		};

		// Send the registration data to the server
		const registerResponse = await fetch(`${registerUrl}`, {
			method: 'POST',
			withCredentials: true,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(credentialJSON),
		});

		const registerResult = await registerResponse.text();
		console.log(registerResult);
	} catch (err) {
		console.error('Registration failed:', err);
	}
}

export async function authenticateUserBiometricCredentials(
	loginChallengeUrl: string = '/auth/login/challenge',
	loginUrl: string = '/auth/login',
	username: string
) {
	// Request an authentication challenge from the server
	const response = await fetch(`${loginChallengeUrl}`, {
		method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({username: username})
	});
	const options = await response.json();

	const pkCred = options.publicKey;
	const publicKeyCredentialRequestOptions = {
		...pkCred,
		challenge: coerceToArrayBuffer(pkCred.challenge),
		allowCredentials: pkCred.allowCredentials.map((cred) => ({
			id: coerceToArrayBuffer(cred.id),
			type: cred.type,
		})),
	};

	try {
		// Trigger Face ID/Fingerprint prompt and authenticate
		const credential = await navigator.credentials.get({
			publicKey: publicKeyCredentialRequestOptions,
		});

		// Convert the credential to base64 to send to the server
		const credentialJSON = {
			id: credential.id,
			rawId: coerceToBase64Url(credential.rawId),
			response: {
				authenticatorData: coerceToBase64Url(credential.response.authenticatorData),
				clientDataJSON: coerceToBase64Url(credential.response.clientDataJSON),
				signature: coerceToBase64Url(credential.response.signature),
				userHandle: credential.response.userHandle
					? coerceToBase64Url(credential.response.userHandle)
					: null,
			},
			type: credential.type,
		};

		// Send the authentication data to the server
		const authResponse = await fetch(`${loginUrl}?username=${username}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(credentialJSON),
		});

		const authResult = await authResponse.json();
		console.log(authResult);
		return authResult;
	} catch (err) {
		console.error('Authentication failed:', err);
	}
}
