import * as echarts from "echarts/core"
import { EffectScatterChart, MapChart, ScatterChart } from "echarts/charts"
import {
  GeoComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"

echarts.use([
  EffectScatterChart,
  MapChart,
  ScatterChart,
  GeoComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
])

let worldReady: Promise<void> | null = null

export const loadWorld = () => {
  worldReady ??= fetch("/geo/world-110m.json")
    .then((res) => res.json())
    .then((geoJson) => echarts.registerMap("world", geoJson))
    .catch((e) => {
      worldReady = null
      throw e
    })
  return worldReady
}

export { echarts }
