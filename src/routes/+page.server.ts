import { is_invalid } from '$lib/FormControl/validation';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export async function load() {
	return {
		//available_exercises: await list_exercises()
	};
}
load satisfies PageServerLoad;

export const actions: Actions = {
	create: async ({ request }) => {
		const form_data = await request.formData();
		/** @type {import('$lib/entities.js').PendingExercise} */
		const pending = {
			label: form_data.get('label')?.toString() ?? null,
			name: form_data.get('name')?.toString() ?? null,
			description: form_data.get('description')?.toString() ?? null,
			alternatives: form_data.getAll('alternatives').map((v) => v.toString())
		};

		const result = await {}; //create_exercise(pending);

		if (is_invalid(result)) {
			return fail(422, {
				exercise: result,
				validation: result.validation
			});
		}

		// redirect(303, `/exercises/${result.label}`);
	}
};
