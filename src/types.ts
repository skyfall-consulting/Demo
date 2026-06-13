export type WeatherMode = 'rain' | 'snow' | 'stars';

export interface FallingObject {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  kind: WeatherMode;
  caught: boolean;
}
