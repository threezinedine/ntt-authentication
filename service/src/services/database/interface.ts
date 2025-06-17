export interface Database {
	connect(): Promise<void>;
	disconnect(): Promise<void>;

	up(): Promise<void>;
	down(): Promise<void>;
}
