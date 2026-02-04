declare module "get-image-colors" {
  interface Color {
    hex(): string;
    rgb(): [number, number, number];
    hsl(): [number, number, number];
    hsv(): [number, number, number];
    cmyk(): [number, number, number, number];
    rgba(): [number, number, number, number];
  }

  function getColors(
    input: string | Buffer,
    type?: string
  ): Promise<Color[]>;

  export default getColors;
}
