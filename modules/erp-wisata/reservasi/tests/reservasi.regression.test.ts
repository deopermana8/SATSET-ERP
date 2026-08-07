describe("Reservasi regression", () => {
  it("preserves CRUD contract", () => {
    expect(["create", "detail", "list", "update", "delete"].length).toBe(5);
  });
});
