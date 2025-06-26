// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Google Analytics gtag 함수 타입 선언
	function gtag(...args: any[]): void;
	interface Window {
		gtag: typeof gtag;
		dataLayer: any[];
	}
}

export {};