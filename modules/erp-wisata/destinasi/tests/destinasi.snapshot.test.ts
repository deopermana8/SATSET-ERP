describe("Destinasi snapshot", () => {
  it("matches snapshot", () => {
    const view = "Destinasi";
    expect(view).toMatchSnapshot();
  });
});
