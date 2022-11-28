export interface GraphSeries {
  name: string;
  data: number[];
}

export interface Graph {
  series: GraphSeries[];
  xAxis: string[];
}
