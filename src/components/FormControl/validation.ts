export type Path = ReadonlyArray<PropertyKey>;

export interface Issue {
	readonly message: string;
	readonly path?: Path;
}

/**
 * The result of validating something. `data` always holds the current field
 * values — whatever was submitted, valid or not — so consumers never need to
 * reconcile a "success" shape against a separate "failure" shape. `validation`
 * is empty when `data` is actually valid; check `validation.has()` (or `.is_valid()`).
 */
export type Validated<Out, Pending = Out> = {
	readonly data: Pending;
	readonly validation: Validation<Out>;
};

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
		validate: (item: In) => Validated<Out, In>,
		base_path: Path = []
	): Array<In | Out> {
		let dirty = false;
		const output = collection.map((item, index) => {
			const result = validate(item);
			if (result.validation.has()) {
				dirty = true;
				this.merge(result.validation, [...base_path, index]);
				return item;
			}
			return result.data as unknown as Out;
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
