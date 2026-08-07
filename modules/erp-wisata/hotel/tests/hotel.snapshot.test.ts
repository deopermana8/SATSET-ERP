describe("Hotel snapshot", () => {
  it("matches snapshot", () => {
    const view = "Hotel";
    expect(view).toMatchSnapshot();
  });
});
