describe("PaketWisata snapshot", () => {
  it("matches snapshot", () => {
    const view = "PaketWisata";
    expect(view).toMatchSnapshot();
  });
});
