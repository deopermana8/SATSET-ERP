export interface IPlugin {
  readonly id: string;
  readonly name: string;

  register(): void;
}
