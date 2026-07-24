export type GuestPreferences = {
  dietary?: string;
  notes?: string;
};

export class Guest {
  public readonly name: string;
  public readonly email?: string;
  public readonly phone?: string;
  public readonly preferences?: GuestPreferences;

  constructor(params: {
    name: string;
    email?: string;
    phone?: string;
    preferences?: GuestPreferences;
  }) {
    if (!params.name?.trim()) {
      throw new Error("Guest name is required");
    }

    this.name = params.name.trim();
    this.email = params.email?.trim();
    this.phone = params.phone?.trim();
    this.preferences = params.preferences;
  }
}
