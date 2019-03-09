type TSumOperand = number;
type TSumResult = number;

//we insert some comments here
//to demonstrate they are present
//when sourcemapping is resolved

export function add(a: TSumOperand, b: TSumOperand): TSumResult {
	return a + b;
}

export function addWithError(a: TSumOperand, b: TSumOperand): TSumResult {
	//we cause error here on purpose to see the sourcemapping works properly
	const c: any = {};
	const d = c["ab"]["cd"];

	return a + b;
}
