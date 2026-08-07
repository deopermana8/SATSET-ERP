describe("Guide snapshot", () => {
  it("matches snapshot", () => {
    const view = "Guide";
    expect(view).toMatchSnapshot();
  });
});
