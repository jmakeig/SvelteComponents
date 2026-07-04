import type { Transport } from '@sveltejs/kit';
import { Validation } from '$components/FormControl/validation';

export const transport: Transport = {
	Validation: {
		encode: (validation) => validation instanceof Validation && validation.toJSON(),
		decode: (validation) => Validation.fromJSON(validation)
	}
};
