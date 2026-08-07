describe("Reservasi snapshot", () => {
  it("matches snapshot", () => {
    const view = "Reservasi";
    expect(view).toMatchSnapshot();
  });
});
