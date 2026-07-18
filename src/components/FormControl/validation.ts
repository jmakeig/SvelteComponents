export type Path = ReadonlyArray<PropertyKey>;

export interface Issue {
	/** The user-facing message to describe the error. */
	readonly message: string;
	/**
	 * Optional identifier for a property. Properties can be hierarchical, so this is
	 * represented as a list of descendent properties. That’s useful for sub-validation
	 * in `collect()`, allowing you to specify a `base_path`. */
	readonly path?: Path;
	/**
	 * Machine-readable category for callers that need to branch on
	 *  _why_ without having to match on `message` text.
	 */
	readonly code?: string;
}

/**
 * APIs should never `throw` because of invalid user input. In that case, they should always return
 * what the user submitted along with the associated validation errors, `Validation<Entity>`.
 * When the data is valid, it will be stongly typed in the `data` property and there will
 * be no `validation` property.
 */
export type Validated<Out> =
	| { readonly data: Out; readonly validation?: never }
	| { readonly data: unknown; readonly validation: Validation<Out> };

export class Validation<Out> {
	#issues: Issue[] = [];

	add(message: Issue['message'], property?: PropertyKey | Path, code?: Issue['code']): Validation<Out> {
		this.#issues.push({
			message,
			path: property ? [...(Array.isArray(property) ? property : [property])] : [],
			code
		});
		return this;
	}

	merge(validation: Validation<Out>, base_path: Path = []): Validation<Out> {
		for (const issue of validation) {
			this.#issues.push({
				message: issue.message,
				path: [...base_path, ...(issue.path ?? [])],
				code: issue.code
			});
		}
		return this;
	}

	issues(path?: Path | string, code?: Issue['code']): ReadonlyArray<Issue> {
		let found: ReadonlyArray<Issue> = this.#issues;
		if (undefined !== path) {
			const _path = 'string' === typeof path ? ('' === path ? [] : [path]) : path;
			found = found.filter((issue) => {
				if (_path.length !== issue.path?.length) return false;
				for (let i = 0; i < _path.length; i++) {
					if (_path[i] !== issue.path?.[i]) return false;
				}
				return true;
			});
		}
		if (undefined !== code) {
			found = found.filter((issue) => issue.code === code);
		}
		return found;
	}

	at(index: number): Issue | undefined {
		return this.#issues.at(index);
	}

	first(path?: Path | string, code?: Issue['code']): Issue | undefined {
		return this.issues(path, code)[0];
	}

	has(path?: Path | string, code?: Issue['code']): boolean {
		return this.issues(path, code).length > 0;
	}

	coded(code?: Issue['code']) : boolean {
		return this.has(undefined, code);
	}

	collect<In, Out>(
		collection: Array<In>,
		validate: (item: In) => Validated<Out>,
		base_path: Path = []
	): Array<In | Out> {
		let dirty = false;
		const output = collection.map((item, index) => {
			const result = validate(item);
			if (result.validation) {
				dirty = true;
				this.merge(result.validation, [...base_path, index]);
				return item;
			}
			return result.data;
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

/************************/

export function is_date(value: string): boolean {
	// 1. Check the syntax structure (YYYY-MM-DDTHH:mm:ss.sssZ)
	const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
	if (!isoRegex.test(value)) return false;

	// 2. Check if it is a real calendar date
	const date = new Date(value);
	return !isNaN(date.getTime()) && date.toISOString() === value;
}
