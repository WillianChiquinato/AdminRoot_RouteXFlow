interface NominatimAddress {
  road?: string;
  pedestrian?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
}

// Converte coordenadas em um endereço legível ("Rua X, 123 - Bairro, Cidade").
// Nunca lança: se o serviço estiver fora ou lento, devolve "" e quem chamou segue sem endereço.
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(latitude),
      lon: String(longitude),
      zoom: "18",
      addressdetails: "1",
      "accept-language": "pt-BR",
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return "";

    const data = (await response.json()) as { address?: NominatimAddress; display_name?: string };
    const a = data.address;
    if (!a) return data.display_name ?? "";

    const street = a.road ?? a.pedestrian ?? "";
    const line = [street, a.house_number].filter(Boolean).join(", ");
    const district = a.suburb ?? a.neighbourhood ?? "";
    const city = a.city ?? a.town ?? a.village ?? a.municipality ?? "";
    const place = [district, city].filter(Boolean).join(", ");

    return [line, place].filter(Boolean).join(" - ") || data.display_name || "";
  } catch {
    return "";
  }
}
