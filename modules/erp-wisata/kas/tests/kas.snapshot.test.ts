describe("Kas snapshot", () => {
  it("matches snapshot", () => {
    const view = "Kas";
    expect(view).toMatchSnapshot();
  });
});
