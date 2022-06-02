<template>
    <div ref="chart" :style="minH ? `width: 100%; height: 100%; min-height: ${minH}` : 'width: 100%; height: 100%;'"></div>
</template>

<script>
import axios from "axios";
import { idGenerator } from "../utils/id";
export default {
    props: ["axis", "lines", "type", "chart_title", "hideTitle", "filters", "hideZoom", "chartTitle", "chartData", "xData", "isRest", "minH", "chartColor"],
    methods: {
        getSeries() {},
        callData() {
            if (this.axis.length >= 1 && this.lines.length >= 1) {
                axios
                    .post("/ve/get-data", {
                        axis: this.axis,
                        lines: this.lines,
                        filters:this.filters
                    })
                    .then(response => {
                        this.elementData = response.data;

                        this.initChart();
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        },
        initChart() {
            if (this.instance) {
                this.instance.dispose();
                this.instance = null;
            }
            var dom = this.$el;
            var wrapper = dom.parentElement;
            dom.style.height = wrapper.offsetHeight + "px";
            // console.log(wrapper.offsetWidth);
            var myChart = window.echarts.init(dom, "light");
            this.instance = myChart;

            let axis = [];
            let series = [];

            this.axis.map(ax => {
                this.elementData.map(sdata => {
                    axis.push(`${sdata[ax.name]}`);
                });
            });
            let colors = [];
            this.lines.map(value => {
                let seriesData = [];

                this.elementData.map(sdata => {
                    seriesData.push(sdata[value.name]);
                });
                if (this.type == "AreaChart") {
                    series.push({
                        name: value.title,
                        type: "line",
                        smooth: true,
                        areaStyle: {},
                        data: seriesData
                    });
                }

                if (this.type == "LineChart") {
                    series.push({
                        name: value.title,
                        type: "line",
                        smooth: true,

                        data: seriesData
                    });
                }

                if (this.type == "ColumnChart") {
                    series.push({
                        name: value.title,
                        type: "bar",
                        smooth: true,

                        data: seriesData
                    });
                }

                if(value["color"] != null && value["color"] != ""){
                    colors.push(value["color"]);
                }
            });

            if (this.axis.length >= 1 && this.lines.length >= 1) {

                myChart.setOption({
                    title: ! this.hideTitle ? {
                        text: this.chart_title,
                      textStyle:{
                        fontFamily:'Arial',
                        fontWeight:"normal"
                      }
                    } : undefined,
                    tooltip: {
                        trigger: "axis",
                        position: function(pt) {
                            return [pt[0], "10%"];
                        }
                    },

                    legend: {
                        data: this.lines.map(line => line.title),
                        align: 'left',
                        left: 10,
                        top: 25,
                    },
                    toolbox: {
                        feature: {
                            // dataZoom: {
                            //     yAxisIndex: "none",
                            //     title: { zoom: "Зурж Томруулах", back: "Буцах" }
                            // },
                            // restore: { title: "Дахин эхлүүл" },
                            saveAsImage: { title: "Татах" },
                            // brush: {},
                            magicType: {
                                type: ["line", "bar"],
                                title: { line: "Шугман", bar: "Багнан" }
                            }
                        }
                    },
                    xAxis: {
                        type: "category",
                        boundaryGap: true,

                        data: axis
                    },
                    yAxis: {
                        type: "value",
                        scale: true,
                        max: function (value) {
                            return value.max - 0;
                        },
                        min: function (value) {
                            return value.min - 0;
                        },
                        boundaryGap: [0, "100%"]
                    },
                   dataZoom:  !this.hideZoom ?[
                        {
                            startValue: axis[0]
                        },
                        {
                            type: "inside"
                        }
                    ] : undefined,
                    series: series,
                    color:colors.length >= 1 ? colors :   undefined
                });
            }
            setTimeout(() => {
                this.initing = false;
            }, 2100);
        },
        initRest(){


            if (this.instance) {
                this.instance.dispose();
                this.instance = null;
            }
            var dom = this.$el;
            var wrapper = dom.parentElement;
            dom.style.height = wrapper.offsetHeight + "px";
            // console.log(wrapper.offsetWidth);
            var myChart = window.echarts.init(dom, "shine");
            this.instance = myChart;
            myChart.setOption({
                title: ! this.hideTitle ? {
                    text: this.chartTitle,
                    textStyle:{
                        fontFamily:'Arial',
                        fontWeight:"normal"
                    }
                } : undefined,
                tooltip: {
                    trigger: "axis",
                    position: function(pt) {
                        return [pt[0], "10%"];
                    }
                },

                legend: {
                    data: this.chartData.map(x=>x.name),
                    align: 'left',
                    left: 10,
                    top: 25,
                },
                toolbox: {
                    feature: {
                        // dataZoom: {
                        //     yAxisIndex: "none",
                        //     title: { zoom: "Зурж Томруулах", back: "Буцах" }
                        // },
                        // restore: { title: "Дахин эхлүүл" },
                        saveAsImage: { title: "Татах" },
                        // brush: {},
                        magicType: {
                            type: ["line", "bar"],
                            title: { line: "Шугман", bar: "Багнан" }
                        }
                    }
                },
                xAxis: {
                    type: "category",
                    boundaryGap: true,

                    data: this.xData
                },
                yAxis: {
                    type: "value",
                    scale: true,
                    boundaryGap: [0, "100%"]
                },
                dataZoom:  !this.hideZoom ?[
                    {
                        startValue: this.xData[0]
                    },
                    {
                        type: "inside"
                    }
                ] : undefined,
                series: this.chartData,
               color:this.chartColor ? this.chartColor : undefined
            });
        }
    },
    beforeMount() {
        this.id = idGenerator("area");
    },
    mounted() {
        if(!this.isRest){
            this.callData();
        } else {
            this.initRest();
        }

    },
    data() {
        return {
            elementData: [],
            instance: null,
            timeout: null
        };
    },
    watch: {
        type: function(val) {
            this.initChart();
        },
        axis: {
            handler: function(after, befor) {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }
                this.timeout = setTimeout(() => {
                    this.callData();
                }, 1200);
            },
            deep: true
        },
        lines: {
            handler: function(after, befor) {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }
                this.timeout = setTimeout(() => {
                    this.callData();
                }, 1200);
            },
            deep: true
        }
    }
};
</script>
