describe("Pembayaran snapshot", () => {
  it("matches snapshot", () => {
    const view = "Pembayaran";
    expect(view).toMatchSnapshot();
  });
});
