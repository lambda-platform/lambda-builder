<template>
    <FormItem :label=label :prop=rule>
        <div class="qgis-map">
            <Spin fix v-if="isLoading"></Spin>
            <Spin fix v-if="isLoadingLayer"></Spin>
            <div id="qgis" style="height: 350px; border-radius: 10px;"></div>
            <div class="map-layer-switcher">
                <a href="javascript:void(0)" @click="switchLayer('googleRoad')">
                    <img src="/images/maps/google-road.jpg" alt="">
                    <span>Google road</span>
                </a>

                <a href="javascript:void(0)" @click="switchLayer('googleSatellite')">
                    <img src="/images/maps/google-satellite.jpg" alt="">
                    <span>Google satellite</span>
                </a>

                <a href="javascript:void(0)" @click="switchLayer('osm')">
                    <img src="/images/maps/openstreet.jpg" alt="">
                    <span>Open Street Map</span>
                </a>
            </div>
        </div>
    </FormItem>
</template>
<script>
import * as wkx from "wkx";

export default {
    props: ["model", "rule", "label", "meta", "do_render", "editMode", "is_show"],
    components: {},

    mounted() {
        if (this.do_render) {
            this.initMap();
        }
    },

    computed: {
        geoVal() {
            return this.model.form[this.model.component]
        }
    },

    watch: {
        do_render(value, oldValue) {
            if (value) {
                if (!this.editMode) {
                    this.initMap();
                } else {
                    if (!this.geoVal && !this.map) {
                        this.initMap();
                    }
                }
            } else {
                this.destroy();
            }
        },

        geoVal(value, oldValue) {
            if (value) {
                if (oldValue === null) {
                    this.getGisData();
                }
            }
        },
    },

    data() {
        return {
            map: null,
            parcelLayer: null,
            currentLayer: null,
            vector: null,
            source: null,
            isLoading: false,
            isLoadingLayer: false,
            q: "",
            selectedLayer: null,
            layers: {
                otm: new ol.source.TileImage({url: "https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png"}),
                osm: new ol.source.TileImage({url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"}),
                osmBW: new ol.source.TileImage({url: "https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png"}),
                osmCycle: new ol.source.TileImage({url: "https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png"}),
                googleLayerRoadNames: new ol.source.TileImage({url: "https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"}),
                googleLayerRoadmap: new ol.source.TileImage({url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"}),
                googleLayerSatellite: new ol.source.TileImage({url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"}),
                esriLayerStreet: new ol.source.TileImage({url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"}),
                esriLayerTopo: new ol.source.TileImage({url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"}),
                cartoPositron: new ol.source.TileImage({url: "https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"}),
                stamenTerrain: new ol.source.TileImage({url: "https://a.tile.stamen.com/terrain/{z}/{x}/{y}.png"}),
                alagacSpecial: new ol.source.TileImage({url: "https://geoportal.nsdi.gov.mn/alagac/rest/services/ALAGAC/11THG/MapServer/tile/{z}/{y}/{x}"}),
                alagacForest: new ol.source.TileImage({url: "https://geoportal.nsdi.gov.mn/alagac/rest/services/ALAGAC/CTM_map/MapServer/tile/{z}/{y}/{x}"}),
                nsdi: new ol.source.TileImage({url: "https://gisserver01.nsdi.gov.mn/gzbgzzg/rest/services/EngineerHM/Ulaanbaatar_Gazar_Hudlul_Bichil_Mujlal_Hursnii_Orgil_Hurdatgal_UTM48N/MapServer/export?bbox=606139.8364730093,5264976.112310054,765882.3714873542,5333060.391939491"})
            },
        };
    },

    methods: {
        initMap() {
            this.source = new ol.source.Vector();
            this.vector = new ol.layer.Vector({
                source: this.source,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: "rgba(255, 255, 255, 0.2)",
                    }),
                    stroke: new ol.style.Stroke({
                        color: "#ffcc33",
                        width: 2,
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: "#ffcc33",
                        }),
                    }),
                }),
            });

            this.currentLayer = new ol.layer.Tile({
                source: new ol.source.TileImage({
                    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
                    crossOrigin: "Anonymous",
                }),
            });

            this.map = new ol.Map({
                target: 'qgis',
                layers: [this.currentLayer, this.vector],
                view: new ol.View({
                    center: ol.proj.fromLonLat([106.831832, 47.8916288]),
                    zoom: 12
                }),
                controls: ol.control.defaults().extend([
                    new ol.control.FullScreen()
                ])
            });

            this.drawLayer();
            // if(this.editMode) {
            //     this.getGisData();
            // }

            this.map.on("click", (evt) => {
                let latlng = ol.proj.transform(
                    evt.coordinate,
                    "EPSG:3857",
                    "EPSG:4326"
                );

                let lat = parseFloat(latlng[1]).toFixed(6);
                let lng = parseFloat(latlng[0]).toFixed(6);

                this.map.getView().setCenter(ol.proj.fromLonLat([parseFloat(lng), parseFloat(lat)]));
                this.map.getView().setZoom(14);

                if (this.parcelLayer != null) {
                    let view = this.map.getView();
                    let viewResolution = view.getResolution();
                    let source = this.parcelLayer.getSource();

                    let url = source.getGetFeatureInfoUrl(evt.coordinate, viewResolution, view.getProjection(), {
                        "INFO_FORMAT": "application/json",
                        "FEATURE_COUNT": 50
                    });

                    if (url) {
                        fetch(url)
                            .then(response => response.json())
                            .then(data => {
                                if (data != null && data.features.length > 0) {
                                    data.features.forEach(item => {
                                        if (item.properties) {
                                            // if(item.geometry.type == 'Point'){
                                            //     this.drawSelectedPoint(item.geometry.coordinates);
                                            //     // console.log(item.geometry.coordinates);
                                            // }else {
                                                this.setFormField(item.properties);
                                                this.model.form[this.model.component] = item.properties[this.meta.qgisOptions.cAttr];
                                                this.geoVal = item.properties[this.meta.qgisOptions.cAttr];
                                                this.getGisData(item.geometry.type);
                                            // }
                                        }
                                    })
                                }
                            });
                    }
                }
            });

            this.map.removeLayer(this.selectedLayer);
            this.map.removeLayer(this.markerLayer);
        },

        switchLayer(layer) {
            switch (layer) {
                case "otm":
                    this.currentLayer.setSource(this.layers.otm);
                    // this.map.removeLayer(this.nameLayer);
                    break;
                case "googleRoad":
                    this.currentLayer.setSource(this.layers.googleLayerRoadmap);
                    // this.nameLayer = this.layers.googleLayerRoadNames;
                    // this.map.addLayer(this.nameLayer);
                    break;
                case "googleSatellite":
                    this.currentLayer.setSource(this.layers.googleLayerSatellite);
                    // this.map.removeLayer(this.nameLayer);
                    break;
                case "esriTopo":
                    this.currentLayer.setSource(this.layers.esriLayerTopo);
                    // this.map.removeLayer(this.nameLayer);
                    break;
                case "esriStreet":
                    this.currentLayer.setSource(this.layers.esriLayerStreet);
                    // this.map.removeLayer(this.nameLayer);
                    break;
                case "cartoPositron":
                    this.currentLayer.setSource(this.layers.cartoPositron);
                    // this.map.removeLayer(this.nameLayer);
                    break;
                case "stamenTerrain":
                    this.currentLayer.setSource(this.layers.stamenTerrain);
                    // this.map.removeLayer(this.nameLayer);
                    break;
                case "osm":
                    this.currentLayer.setSource(this.layers.osm);
                    // this.map.removeLayer(this.nameLayer);
                    break;
                case "osmBW":
                    this.currentLayer.setSource(this.layers.osmBW);
                    // this.map.removeLayer(this.nameLayer);
                    break;
                case "osmCycle":
                    this.currentLayer.setSource(this.layers.osmCycle);
                    // this.map.removeLayer(this.nameLayer);
                    break;
                case "alagacSpecial":
                    this.currentLayer.setSource(this.layers.alagacSpecial);
                    // this.map.removeLayer(this.nameLayer);
                    break;
                case "alagacForest":
                    this.currentLayer.setSource(this.layers.alagacForest);
                    // this.map.removeLayer(this.nameLayer);
                    break;
                case "nsdi":
                    this.currentLayer.setSource(this.layers.nsdi);
                    // this.map.removeLayer(this.nameLayer);
                    break;
                default:
                    break;
            }
        },

        setFormField(attr) {
            this.meta.qgisOptions.attrList.forEach(item => {
                this.model.form[item.label] = attr[item.value];
            })
        },

        drawLayer() {
            this.isLoadingLayer = true;
            this.parcelLayer = new ol.layer.Tile({
                name: "wms",
                source: new ol.source.TileWMS({
                    ratio: 1,
                    url: this.meta.qgisOptions.service,
                    params: {
                        'FORMAT': 'image/png',
                        'VERSION': '1.1.1',
                        tiled: true,
                        "STYLES": '',
                        "LAYERS": this.meta.qgisOptions.link,
                        "exceptions": 'application/vnd.ogc.se_inimage',
                        tilesOrigin: 619573.6875 + "," + 5296553.5
                    }
                })
            });

            this.map.addLayer(this.parcelLayer);
            this.isLoadingLayer = false;
        },

        getGisData() {
            this.isLoading = true;

            axios.get(`https://urban.gov.mn/urban/gis/${this.meta.qgisOptions.cTable}/${this.meta.qgisOptions.cShapeField}/${this.meta.qgisOptions.cAttr}/${this.geoVal}`)
                .then(({data}) => {
                    if (data.status) {
                        this.map.removeLayer(this.selectedLayer);
                        if(data.point){
                            let point = JSON.parse(data.geo_shape);
                            this.drawSelectedPoint(point.coordinates)
                        }else {
                            this.drawSelected(data.shape);
                        }
                        let center = JSON.parse(data.center);
                        this.map.getView().setCenter(ol.proj.fromLonLat(center.coordinates));
                        this.map.getView().setZoom(15);
                    }
                    this.isLoading = false;
                }).catch(() => {
                this.isLoading = false;
            })
        },

        drawSelectedPoint(coords) {
            this.map.removeLayer(this.markerLayer);
            let markerGeometry = new ol.geom.Point(ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857'));
            let markerFeature = new ol.Feature({
                geometry: markerGeometry
            });

            let markerStyle = new ol.style.Icon(({
                src: '/images/markers/default.png',
                // src: 'https://github.com/openlayers/openlayers/blob/v3.20.1/examples/resources/logo-70x70.png'
            }));

            markerFeature.setStyle(new ol.style.Style({
                image: markerStyle,
            }));

            let vectorSource = new ol.source.Vector({
                features: [markerFeature]
            });

            this.markerLayer = new ol.layer.Vector({
                title: "Selected Point",
                visible: true,
                source: vectorSource
            });

            console.log("I am here", this.markerLayer);

            this.map.addLayer(this.markerLayer);
        },

        drawSelected(geom) {
            this.map.removeLayer(this.selectedLayer);
            let format = new ol.format.WKT();
            let feature = format.readFeature(geom);
            feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

            let wktStyle = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255,0,0, .5)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(255,0,0, 1)',
                    width: 2,
                    lineDash: [.1, 5]
                }),
            });

            this.selectedLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [feature]
                }),
                style: wktStyle
            });

            this.map.addLayer(this.selectedLayer);
        },

        destroy() {
            this.map.removeLayer(this.selectedLayer);
            this.map.getView().setCenter(ol.proj.fromLonLat([106.831832, 47.8916288]));
            this.map.getView().setZoom(12);
        },
    }
};
</script>
