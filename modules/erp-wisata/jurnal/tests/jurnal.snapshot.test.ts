describe("Jurnal snapshot", () => {
  it("matches snapshot", () => {
    const view = "Jurnal";
    expect(view).toMatchSnapshot();
  });
});
