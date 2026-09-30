<template>
  <div ref="container" class="rx-map"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import type { Map as MapLibreMap, Marker, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type {
  IRouteDetail,
  IRouteStop,
} from "~/infra/interfaces/services/route";

// Estilo vetorial gratuito (OpenFreeMap), sem chave de API. Para trocar de
// provedor basta apontar para outro style.json compatível com MapLibre.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// Servidor demo público do OSRM (uso leve). Em produção, use uma instância
// própria ou outro provedor de roteamento (Valhalla, GraphHopper, ORS...).
const ROUTING_URL = "https://router.project-osrm.org/route/v1/driving";
let plannedToken = 0;

const props = defineProps<{ detail: IRouteDetail }>();
const emit = defineEmits<{ (e: "select", stopId: number): void }>();

const container = ref<HTMLElement | null>(null);

let maplibre: typeof import("maplibre-gl") | null = null;
let map: MapLibreMap | null = null;
let markers: Marker[] = [];
const stopMarkers = new Map<number, { marker: Marker; stop: IRouteStop }>();
let popup: Popup | null = null;

const STATUS_COLOR: Record<string, string> = {
  Pendente: "#8a948e",
  EmAndamento: "#efa04e",
  Concluído: "#55b47a",
  Cancelado: "#c0503a",
};

function row(label: string, value: string) {
  const el = document.createElement("div");
  el.className = "rx-popup-row";
  const l = document.createElement("span");
  l.textContent = label;
  const v = document.createElement("strong");
  v.textContent = value;
  el.append(l, v);
  return el;
}

// Monta o conteúdo via DOM (textContent) para não interpretar HTML vindo da API.
function buildPopupContent(stop: IRouteStop) {
  const root = document.createElement("div");
  root.className = "rx-popup";

  const title = document.createElement("h4");
  title.textContent = `${stop.sequence}. ${stop.name}`;
  root.append(title);

  const address = document.createElement("p");
  address.textContent = stop.address;
  root.append(address);

  root.append(row("Tipo", stopTypeLabel(stop.type)));
  root.append(row("Status", stopStatusLabel(stop.status)));
  if (stop.appName) root.append(row("Plataforma", stop.appName));
  if (stop.value !== null) root.append(row("Valor", formatCurrency(stop.value)));
  if (stop.trackingCode) root.append(row("Rastreio", stop.trackingCode));
  if (stop.recipientName) root.append(row("Destinatário", stop.recipientName));
  if (stop.estimatedArrivalAt)
    root.append(row("Previsto", formatTime(stop.estimatedArrivalAt)));
  if (stop.arrivedAt) root.append(row("Chegada", formatTime(stop.arrivedAt)));
  if (stop.completedAt)
    root.append(row("Conclusão", formatTime(stop.completedAt)));
  if (stop.supplierConfirmed !== null)
    root.append(
      row(
        "Baixa no fornecedor",
        stop.supplierConfirmed ? "Confirmada" : "Pendente",
      ),
    );
  if (stop.notes) {
    const notes = document.createElement("p");
    notes.className = "rx-popup-notes";
    notes.textContent = stop.notes;
    root.append(notes);
  }
  return root;
}

// O elemento externo é posicionado pelo MapLibre via transform e não pode ter
// transition/transform próprios; o visual e o hover ficam no elemento interno.
function pinElement(className: string, text = "") {
  const el = document.createElement("div");
  const inner = document.createElement("div");
  inner.className = className;
  inner.textContent = text;
  el.append(inner);
  return el;
}

function clearOverlays() {
  popup?.remove();
  popup = null;
  markers.forEach((marker) => marker.remove());
  markers = [];
  stopMarkers.clear();
  if (map) {
    if (map.getLayer("route-path")) map.removeLayer("route-path");
    if (map.getSource("route-path")) map.removeSource("route-path");
    if (map.getLayer("route-planned")) map.removeLayer("route-planned");
    if (map.getSource("route-planned")) map.removeSource("route-planned");
  }
  plannedToken++;
}

function showStop(stop: IRouteStop, marker: Marker) {
  if (!maplibre || !map) return;
  popup?.remove();
  popup = new maplibre.Popup({ offset: 22, maxWidth: "280px" })
    .setLngLat(marker.getLngLat())
    .setDOMContent(buildPopupContent(stop))
    .addTo(map);
  emit("select", stop.id);
}

function render() {
  if (!maplibre || !map) return;
  const lib = maplibre;
  clearOverlays();

  const detail = props.detail;
  const bounds = new lib.LngLatBounds();

  const pathCoords = detail.path.map(
    (p) => [p.longitude, p.latitude] as [number, number],
  );
  pathCoords.forEach((c) => bounds.extend(c));
  if (pathCoords.length > 1) {
    map.addSource("route-path", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: pathCoords },
      },
    });
    map.addLayer({
      id: "route-path",
      type: "line",
      source: "route-path",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#26845b", "line-width": 5, "line-opacity": 0.85 },
    });
  }

  const originLngLat: [number, number] = [
    detail.origin.longitude,
    detail.origin.latitude,
  ];
  bounds.extend(originLngLat);
  markers.push(
    new lib.Marker({ element: pinElement("rx-pin rx-pin-origin", "A") })
      .setLngLat(originLngLat)
      .setPopup(new lib.Popup({ offset: 18 }).setText("Origem"))
      .addTo(map),
  );

  if (detail.destination) {
    const destLngLat: [number, number] = [
      detail.destination.longitude,
      detail.destination.latitude,
    ];
    bounds.extend(destLngLat);
    markers.push(
      new lib.Marker({ element: pinElement("rx-pin rx-pin-dest", "B") })
        .setLngLat(destLngLat)
        .setPopup(new lib.Popup({ offset: 18 }).setText("Destino"))
        .addTo(map),
    );
  }

  detail.stops.forEach((stop) => {
    const lat = parseFloat(stop.latitude ?? "");
    const lng = parseFloat(stop.longitude ?? "");
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    const el = pinElement("rx-pin rx-pin-stop", String(stop.sequence));
    (el.firstElementChild as HTMLElement).style.background =
      STATUS_COLOR[stop.status] ?? "#8a948e";
    el.title = stop.name;

    const marker = new lib.Marker({ element: el }).setLngLat([lng, lat]).addTo(map!);
    el.addEventListener("click", (event) => {
      event.stopPropagation();
      showStop(stop, marker);
    });

    markers.push(marker);
    stopMarkers.set(stop.id, { marker, stop });
    bounds.extend([lng, lat]);
  });

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 0 });
  }

  // Rota planejada: origem -> paradas (por sequência) -> destino.
  const plannedPoints: [number, number][] = [originLngLat];
  [...detail.stops]
    .sort((a, b) => a.sequence - b.sequence)
    .forEach((stop) => {
      const lat = parseFloat(stop.latitude ?? "");
      const lng = parseFloat(stop.longitude ?? "");
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) plannedPoints.push([lng, lat]);
    });
  if (detail.destination) {
    plannedPoints.push([detail.destination.longitude, detail.destination.latitude]);
  }
  drawPlannedRoute(plannedPoints);
}

function setPlannedData(coordinates: [number, number][]) {
  const source = map?.getSource("route-planned") as
    | import("maplibre-gl").GeoJSONSource
    | undefined;
  source?.setData({
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates },
  });
}

// Começa com linhas retas tracejadas (funciona offline) e, se o OSRM responder,
// troca pela geometria seguindo as ruas.
async function drawPlannedRoute(points: [number, number][]) {
  if (!map || points.length < 2) return;
  const token = ++plannedToken;

  map.addSource("route-planned", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: points },
    },
  });
  map.addLayer(
    {
      id: "route-planned",
      type: "line",
      source: "route-planned",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": "#2b7fff",
        "line-width": 5,
        "line-opacity": 0.9,
        "line-dasharray": [2, 2],
      },
    },
    map.getLayer("route-path") ? "route-path" : undefined,
  );

  try {
    const coords = points.map(([lng, lat]) => `${lng},${lat}`).join(";");
    const response = await fetch(
      `${ROUTING_URL}/${coords}?overview=full&geometries=geojson`,
    );
    const data = await response.json();
    if (token !== plannedToken || !map) return;

    const geometry = data?.routes?.[0]?.geometry?.coordinates;
    if (data?.code !== "Ok" || !geometry?.length) return;

    setPlannedData(geometry);
    map.setPaintProperty("route-planned", "line-dasharray", [1, 0]);
  } catch (error) {
    console.error("[RouteMap] roteamento indisponível, usando linha reta", error);
  }
}

function focusStop(stopId: number) {
  const entry = stopMarkers.get(stopId);
  if (!entry || !map) return;
  map.flyTo({ center: entry.marker.getLngLat(), zoom: Math.max(map.getZoom(), 15) });
  showStop(entry.stop, entry.marker);
}

defineExpose({ focusStop });

onMounted(async () => {
  if (!container.value) return;
  maplibre = await import("maplibre-gl");
  map = new maplibre.Map({
    container: container.value,
    style: MAP_STYLE,
    center: [props.detail.origin.longitude, props.detail.origin.latitude],
    zoom: 12,
  });
  map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
  map.on("load", render);
  map.on("error", (event) => console.error("[RouteMap]", event.error));
});

watch(
  () => props.detail,
  () => {
    if (map?.loaded()) render();
  },
);

onBeforeUnmount(() => {
  clearOverlays();
  map?.remove();
  map = null;
});
</script>

<style lang="scss">
.rx-map {
  width: 100%;
  height: 380px;
  border-radius: 8px;
  overflow: hidden;
}

.rx-pin {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid var(--bd-ffffff);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  color: var(--fg-ffffff);
  font: 700 12px "Space Grotesk", sans-serif;
  cursor: pointer;
}

.rx-pin-origin {
  background: var(--bg-22714e);
}

.rx-pin-dest {
  background: var(--bg-c0503a);
  border-radius: 6px;
}

.rx-pin-stop {
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.15);
  }
}

.rx-popup {
  min-width: 200px;
  font-size: 11px;
  color: var(--fg-48564e);

  h4 {
    font: 600 13px "Space Grotesk", sans-serif;
    margin: 0 18px 4px 0;
  }

  p {
    margin: 0 0 8px;
    color: var(--fg-78837c);
  }
}

.rx-popup-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 3px 0;
  border-top: 1px solid var(--bd-f0f3f0);

  span {
    color: var(--fg-78837c);
  }
}

.rx-popup-notes {
  margin-top: 8px !important;
  font-style: italic;
}
</style>
