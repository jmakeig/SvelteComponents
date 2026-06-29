export type Path = ReadonlyArray<PropertyKey>;

export interface Issue {
	readonly message: string;
	readonly path?: Path;
}

/**
 * An invalid response. The validation results are in the `'validation'` key and
 * the input property is in the `Prop` property, defaulting to `'input'`.
 * Use `is_invalid()` to test for an `Invalid` instance.
 */
export type Invalid<In, Out, Prop extends string = 'input'> = {
	readonly validation: Validation<Out>;
} & {
	readonly [property in Prop]: In;
};

export type MaybeInvalid<In, Out, Prop extends string = 'input'> = Out | Invalid<In, Out, Prop>;

export class Validation<Out> {
	#issues: Issue[] = [];

	add(message: Issue['message'], property?: PropertyKey | Path): Validation<Out> {
		this.#issues.push({
			message,
			path: property ? [...(Array.isArray(property) ? property : [property])] : []
		});
		return this;
	}

	merge(validation: Validation<unknown>, base_path: Path = []): Validation<Out> {
		for (const issue of validation) {
			this.#issues.push({
				message: issue.message,
				path: [...base_path, ...(issue.path ?? [])]
			});
		}
		return this;
	}

	issues(path?: Path | string): ReadonlyArray<Issue> {
		if (undefined === path) return this.#issues;
		const _path = 'string' === typeof path ? ('' === path ? [] : [path]) : path;
		return this.#issues.filter((issue) => {
			if (_path.length !== issue.path?.length) return false;
			for (let i = 0; i < _path.length; i++) {
				if (_path[i] !== issue.path?.[i]) return false;
			}
			return true;
		});
	}

	at(index: number): Issue | undefined {
		return this.#issues.at(index);
	}

	first(path?: Path | string): Issue | undefined {
		return this.issues(path)[0];
	}

	has(path?: Path | string): boolean {
		return this.issues(path).length > 0;
	}

	collect<In, Out>(
		collection: Array<In>,
		validate: (item: In) => MaybeInvalid<In, Out>,
		base_path: Path = []
	): Array<In | Out> {
		let dirty = false;
		const output = collection.map((item, index) => {
			const result = validate(item);
			if (is_invalid(result)) {
				dirty = true;
				this.merge(result.validation, [...base_path, index]);
				return item;
			}
			return result;
		});
		if (dirty) return collection;
		return output;
	}

	toJSON(): readonly Issue[] {
		return this.#issues;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static fromJSON(json: any): Validation<unknown> {
		return new Validation().merge(json);
	}

	is_valid(): boolean {
		return !this.has();
	}

	[Symbol.iterator]() {
		return this.#issues[Symbol.iterator]();
	}

	get length(): number {
		return this.#issues.length;
	}

	toString(): string {
		return this.#issues
			.map((issue) => `${issue.message} (${issue.path ? issue.path.join(' > ') : ''})`)
			.join('\n');
	}
}

export function is_invalid<In, Out, Prop extends string = 'input'>(
	result: MaybeInvalid<In, Out, Prop>
): result is Invalid<In, Out, Prop> {
	return (
		'object' === typeof result &&
		null !== result &&
		'validation' in result &&
		result.validation instanceof Validation
	);
}
