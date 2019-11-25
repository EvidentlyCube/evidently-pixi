
export interface Constructor<T>{
	new (...args: any[]): T;
}

export interface ObjectKeymap {
	[key: string]: any;
}

export interface Hashmap<T> {
	[key: string]: T;
}