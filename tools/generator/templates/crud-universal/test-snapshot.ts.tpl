describe("{{names.entity.pascal}} snapshot", () => {
  it("matches snapshot", () => {
    const view = "{{names.entity.pascal}}";
    expect(view).toMatchSnapshot();
  });
});
