describe("Ticketing snapshot", () => {
  it("matches snapshot", () => {
    const view = "Ticketing";
    expect(view).toMatchSnapshot();
  });
});
