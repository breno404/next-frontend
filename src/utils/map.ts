import type { DirectionsResponseData } from "@googlemaps/google-maps-services-js";
import { sample, shuffle } from "lodash";

type RouteOptions =
    {
        routeId: string;
        startMarkerOptions: google.maps.marker.AdvancedMarkerElementOptions;
        endMarkerOptions: google.maps.marker.AdvancedMarkerElementOptions;
        carMarkerOptions: google.maps.marker.AdvancedMarkerElementOptions;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        directionsResponseData?: DirectionsResponseData & { request: any };
    }


export class Map {
    public map: google.maps.Map
    public routes: { [routeId: string]: MapRoute } = {}

    constructor(element: HTMLElement, options: google.maps.MapOptions) {
        this.map = new google.maps.MMap(element, {
            ...options,
            /*styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                    {
                      featureType: "administrative.locality",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#d59563" }],
                    },
                    {
                      featureType: "poi",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#d59563" }],
                    },
                    {
                      featureType: "poi.park",
                      elementType: "geometry",
                      stylers: [{ color: "#263c3f" }],
                    },
                    {
                      featureType: "poi.park",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#6b9a76" }],
                    },
                    {
                      featureType: "road",
                      elementType: "geometry",
                      stylers: [{ color: "#38414e" }],
                    },
                    {
                      featureType: "road",
                      elementType: "geometry.stroke",
                      stylers: [{ color: "#212a37" }],
                    },
                    {
                      featureType: "road",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#9ca5b3" }],
                    },
                    {
                      featureType: "road.highway",
                      elementType: "geometry",
                      stylers: [{ color: "#746855" }],
                    },
                    {
                      featureType: "road.highway",
                      elementType: "geometry.stroke",
                      stylers: [{ color: "#1f2835" }],
                    },
                    {
                      featureType: "road.highway",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#f3d19c" }],
                    },
                    {
                      featureType: "transit",
                      elementType: "geometry",
                      stylers: [{ color: "#2f3948" }],
                    },
                    {
                      featureType: "transit.station",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#d59563" }],
                    },
                    {
                      featureType: "water",
                      elementType: "geometry",
                      stylers: [{ color: "#17263c" }],
                    },
                    {
                      featureType: "water",
                      elementType: "labels.text.fill",
                      stylers: [{ color: "#515c6d" }],
                    },
                    {
                      featureType: "water",
                      elementType: "labels.text.stroke",
                      stylers: [{ color: "#17263c" }],
                    },
                  ],*/
        })
    }

    async addRoute(routeOptions: RouteOptions) {
        if (routeOptions.routeId in this.routes) {
            throw new MapRouteExistsError()
        }

        const { startMarkerOptions, endMarkerOptions, carMarkerOptions } = routeOptions

        const route = new MapRoute({
            startMarkerOptions: { ...startMarkerOptions, map: this.map },
            endMarkerOptions: { ...endMarkerOptions, map: this.map },
            carMarkerOptions: { ...carMarkerOptions, map: this.map }
        })
        this.routes[routeOptions.routeId] = route

        await route.calculateRoute(routeOptions.carMarkerOptions.directionsResponseData)

        this.fitBounds()
    }

    async addRouteWithIcons(routeOptions: {
        routeId: string;
        startMarkerOptions: Omit<
            google.maps.marker.AdvancedMarkerElementOptions,
            "icon"
        >;
        endMarkerOptions: Omit<
            google.maps.marker.AdvancedMarkerElementOptions,
            "icon"
        >;
        carMarkerOptions: Omit<
            google.maps.marker.AdvancedMarkerElementOptions,
            "icon"
        >;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        directionsResponseData?: DirectionsResponseData & { request: any };
    }) {
        const color = sample(shuffle(colors)) as string
        return this.addRoute({
            ...routeOptions,
            startMarkerOptions: {
                ...routeOptions.startMarkerOptions,
                content: makeMarkerIcon(color),
            },
            endMarkerOptions: {
                ...routeOptions.endMarkerOptions,
                content: makeMarkerIcon(color),
            },
            carMarkerOptions: {
                ...routeOptions.carMarkerOptions,
                content: makeCarIcon(color),
            },
            directionsResponseData: routeOptions.directionsResponseData,
        });
    }

    private fitBounds() {
        const bounds = new google.maps.LatLngBounds()

        Object.keys(this.routes).forEach((id: string) => {
            const route = this.routes[id]

            bounds.extend(route.startMarker.position!)
            bounds.extend(route.endMarker.position!)
        })

        this.map.fitBounds(bounds)
    }

    moveCar(routeId: string, position: google.maps.LatLngLiteral) {
        this.routes[routeId].carMarker.position = {
            lat: position.lat,
            lng: position.lng
        }
    }
}