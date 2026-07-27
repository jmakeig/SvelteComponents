interface SerializableError {
	message: string;
	name?: string;
	stack?: Array<string>;
}

declare global {
	namespace App {
		interface Error {
			message: string;
			original?: SerializableError;
		}
		interface Locals {
			timezone: string;
			locale: string[];
		}
	}
}
export {};
