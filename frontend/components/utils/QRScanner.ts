// qr-scanner.ts
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

class QrScanner extends HTMLElement {
	private html5QrCode: Html5Qrcode | null = null;
	private scannerId: string;

	constructor() {
		super();
		this.scannerId = 'qr-scanner';
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		this.shadowRoot!.innerHTML = `
      <div style="width: 300px; height: 300px;"></div>
      <button id="start-scan">Start Scan</button>
      <button id="stop-scan" disabled>Stop Scan</button>
    `;

		// Create a container in Light DOM (outside shadow DOM)
		const qrScannerContainer = document.createElement('div');
		qrScannerContainer.id = this.scannerId;
		qrScannerContainer.style.width = '300px';
		qrScannerContainer.style.height = '300px';
		document.body.appendChild(qrScannerContainer);

		this.html5QrCode = new Html5Qrcode(this.scannerId);
		this.setupEventListeners();
	}

	setupEventListeners() {
		const startButton = this.shadowRoot!.querySelector(
			'#start-scan'
		) as HTMLButtonElement;
		const stopButton = this.shadowRoot!.querySelector(
			'#stop-scan'
		) as HTMLButtonElement;

		startButton.addEventListener('click', () => this.startScan());
		stopButton.addEventListener('click', () => this.stopScan());
	}

	async startScan() {
		const startButton = this.shadowRoot!.querySelector(
			'#start-scan'
		) as HTMLButtonElement;
		const stopButton = this.shadowRoot!.querySelector(
			'#stop-scan'
		) as HTMLButtonElement;

		if (this.html5QrCode) {
			try {
				await this.html5QrCode.start(
					{ facingMode: 'environment' },
					{ fps: 10, qrbox: 250 },
					(decodedText: string) => this.onScanSuccess(decodedText),
					(error: string) => console.warn(`QR error: ${error}`)
				);
				startButton.disabled = true;
				stopButton.disabled = false;
			} catch (err) {
				console.error('Error starting QR scanner', err);
			}
		}
	}

	stopScan() {
		const startButton = this.shadowRoot!.querySelector(
			'#start-scan'
		) as HTMLButtonElement;
		const stopButton = this.shadowRoot!.querySelector(
			'#stop-scan'
		) as HTMLButtonElement;

		if (this.html5QrCode) {
			this.html5QrCode
				.stop()
				.then(() => {
					startButton.disabled = false;
					stopButton.disabled = true;
				})
				.catch(console.error);
		}
	}

	onScanSuccess(decodedText: string) {
		const event = new CustomEvent('qr-scan-success', {
			detail: { decodedText },
		});
		this.dispatchEvent(event);
		this.stopScan();
	}

	disconnectedCallback() {
		this.stopScan();
		this.html5QrCode = null;
	}
}

customElements.define('qr-scanner', QrScanner);
export default QrScanner;
