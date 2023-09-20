import { interpretVTL, parseVTLVariables } from '../../utils/vtl';

// Interpret counter, used for testing purpose
let interpretCount = 0;

type IterationLevel = number;

export class LunaticVariables {
	private dictionary = new Map<string, LunaticVariable>();

	constructor() {
		interpretCount = 0;
	}

	/**
	 * Retrieve variable value
	 */
	public get<T>(name: string, iteration?: IterationLevel) {
		if (!this.dictionary.has(name)) {
			return undefined;
		}
		return this.dictionary.get(name)!.getValue(iteration) as T;
	}

	/**
	 * Set variable value
	 */
	public set(name: string, value: unknown): LunaticVariable {
		if (!this.dictionary.has(name)) {
			this.dictionary.set(name, new LunaticVariable());
		}
		const variable = this.dictionary.get(name)!;
		variable.setValue(value);
		return variable;
	}

	/**
	 * Register calculated variable
	 */
	public setCalculated(
		name: string,
		expression: string,
		dependencies?: string[]
	): LunaticVariable {
		if (this.dictionary.has(name)) {
			return this.dictionary.get(name)!;
		}
		const variable = new LunaticVariable({
			expression: expression,
			dictionary: this.dictionary,
			dependencies: dependencies,
		});
		this.dictionary.set(name, variable);
		return variable;
	}

	public run(expression: string, iteration?: IterationLevel): unknown {
		return this.setCalculated(expression, expression).getValue(iteration);
	}

	// Retrieve the number of interpret() run, used in testing
	get interpretCount() {
		return interpretCount;
	}
}

class LunaticVariable {
	// Last time the value was updated (changed)
	public updatedAt = new Map<undefined | IterationLevel, number>();
	// Last time "calculation" was run (for calculated variable)
	private calculatedAt = new Map<undefined | IterationLevel, number>();
	// Internal value for the variable
	private value: unknown;
	// List of dependencies, ex: ['FIRSTNAME', 'LASTNAME']
	private dependencies?: string[];
	// Expression for calculated variable
	private readonly expression?: string;
	// Dictionary holding all the available variables
	private readonly dictionary?: Map<string, LunaticVariable>;

	constructor(
		args: {
			expression?: string;
			dependencies?: string[];
			dictionary?: Map<string, LunaticVariable>;
		} = {}
	) {
		const { expression, dictionary, dependencies } = args;
		if (expression && !dictionary) {
			throw new Error(
				`A calculated variable needs a dictionary to retrieve his deps`
			);
		}
		this.expression = expression;
		this.dictionary = dictionary;
		this.dependencies = dependencies;
	}

	getValue(iteration?: IterationLevel): unknown {
		// The variable is not calculated
		if (!this.expression) {
			return this.getSavedValue(iteration);
		}
		// Calculate bindings first to refresh "updatedAt" on calculated dependencies
		const bindings = this.getDependenciesValues(iteration);
		if (!this.isOutdated(iteration)) {
			return this.getSavedValue(iteration);
		}
		if ((import.meta as any).env.MODE === 'test') {
			interpretCount++;
		}
		// Remember the value
		try {
			this.setValue(interpretVTL(this.expression, bindings), iteration);
		} catch (e) {
			throw new Error(
				`Cannot interpret expression "${
					this.expression
				}" with bindings ${JSON.stringify(bindings)}, error : ${(
					e as Error
				).toString()}`
			);
		}
		this.calculatedAt.set(iteration, performance.now());
		this.calculatedAt.set(undefined, performance.now());
		return this.getSavedValue(iteration);
	}

	setValue(value: unknown, iteration?: IterationLevel): void {
		if (value === this.getSavedValue(iteration)) {
			return;
		}
		// Decompose arrays, to only update items that changed
		if (Array.isArray(value) && iteration === undefined) {
			value.forEach((v, k) => this.setValue(v, k));
			return;
		}
		// We want to save a value at a specific iteration, but the value is not an array yet
		if (iteration !== undefined && !Array.isArray(this.value)) {
			this.value = [];
		}
		if (iteration === undefined) {
			this.value = value;
		} else {
			(this.value as unknown[])[iteration] = value;
		}
		this.updatedAt.set(iteration, performance.now());
		this.updatedAt.set(undefined, performance.now());
	}

	private getSavedValue(iteration?: IterationLevel): unknown {
		if (iteration !== undefined && Array.isArray(this.value)) {
			return this.value[iteration];
		}
		return this.value;
	}

	private getDependencies(): string[] {
		// Calculate dependencies from expression on the fly if necessary
		if (this.dependencies === undefined) {
			this.dependencies = parseVTLVariables(this.expression!);
		}
		return this.dependencies;
	}

	private getDependenciesValues(
		iteration?: IterationLevel
	): Record<string, unknown> {
		return Object.fromEntries(
			this.getDependencies().map((dep) => {
				return [dep, this.dictionary?.get(dep)?.getValue(iteration)];
			})
		);
	}

	private isOutdated(iteration?: IterationLevel): boolean {
		const dependenciesUpdatedAt = Math.max(
			...this.getDependencies().map(
				(dep) => this.dictionary?.get(dep)?.updatedAt.get(iteration) ?? 0
			)
		);
		return dependenciesUpdatedAt > (this.calculatedAt.get(iteration) ?? -1);
	}
}
