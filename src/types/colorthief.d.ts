declare module "colorthief" {
  type RGB = [number, number, number];

  class ColorThief {
    getPalette(
      sourceImage: string | Buffer,
      colorCount?: number,
      quality?: number
    ): Promise<RGB[]>;
  }

  export default ColorThief;
}
