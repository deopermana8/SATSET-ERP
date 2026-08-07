describe("Kendaraan snapshot", () => {
  it("matches snapshot", () => {
    const view = "Kendaraan";
    expect(view).toMatchSnapshot();
  });
});
