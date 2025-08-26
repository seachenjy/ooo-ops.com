<template>
    <div v-loading="isloading" ref="svgRef" class="chart-style"></div>
</template>

<script setup>
import * as d3 from 'd3'
import {computed, onMounted, ref} from 'vue'
import {settingStore} from '@/store/setting'
import { useRoute } from 'vue-router'
import { effect } from 'vue'
const setting = settingStore()

const svgRef = ref(null)
const isloading = ref(false)

const margin = { top: 20, right: 80, bottom: 30, left: 50 };

const route = useRoute()

onMounted(()=>{
    const height = !!svgRef.value ? svgRef.value.offsetHeight-30 : 700
    const width = !!svgRef.value ? svgRef.value.offsetWidth-30 : 1000
    setting.setIndustry(route.query.industry)
    isloading.value=true
    setting.getLineData().then(()=>{
        // 1. 格式化数据：转时间、归一为对象
        const stocks = {}
        setting.lineData.map(item => {
            const y = item.trade_date.slice(0, 4);
            const m = item.trade_date.slice(4, 6);
            const d = item.trade_date.slice(6, 8);
            const s = {
                date: new Date(`${y}-${m}-${d}`),
                value: +item.close
            }
            if(stocks[item.name]){
                stocks[item.name].values.push(s)
            }else{
                stocks[item.name] = {
                    name: item.name,
                    values: [s]
                }
            }
        });
        const data = Object.values(stocks)
        isloading.value = false
        
        data.forEach(series => {
            const values = series.values.map(d => d.value);
            const min = Math.min(...values);
            const max = Math.max(...values);

            series.values.forEach(d => {
                d.normValue = (d.value - min) / (max - min); // 归一化到0~1
            });
        });
        const svg = d3.select(svgRef.value)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

        const x = d3.scaleTime()
        .domain(d3.extent(data[0].values, d => d.date))
        .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom, margin.top]);

        // 6. 创建 x/y 轴
        const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.normValue));

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const lines = svg.selectAll(".series")
        .data(data)
        .enter()
        .append("path")
        .attr("class", "series")
        .attr("d", d => line(d.values))
        .attr("fill", "none")
        .attr("stroke", d => color(d.name))
        .attr("stroke-width", 2)
        .attr("opacity", 0.1)
        .on("mouseover", function (event, d) {
            d3.selectAll(".series")
            .attr("opacity", 0.1);
            d3.select(this)
            .attr("stroke-width", 3)
            .attr("opacity", 1);
            d3.select(`#label-${d.name}`).style("opacity", 1);
        })
        .on("mouseout", function (event, d) {
            d3.selectAll(".series")
            .attr("stroke-width", 2)
            .attr("opacity", 0.1);
            d3.select(`#label-${d.name}`).style("opacity", 0.1);
        });

        // 添加 label（名字）
        svg.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "label")
        .style("opacity", 0.1)
        .attr("fill", d => color(d.name))
        .attr("id", d => `label-${d.name}`)
        .attr("x", d => {
            const last = d.values[d.values.length - 1];
            return x(last.date) + 4; // 向右偏移一点避免重叠
        })
        .style("font-size", "12px")
        .attr("y", d => {
            const last = d.values[d.values.length - 1];
            return y(last.normValue);
        })
        .attr("alignment-baseline", "middle")
        .text(d => d.name);

        svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

        svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));


    });
})
</script>
<style scoped>
.chart-style {
    background: #333 !important;
}
</style>