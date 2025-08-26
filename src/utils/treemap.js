import * as d3 from 'd3'
import {settingStore} from '@/store/setting'

class treemap extends EventTarget{
    
    constructor(ref,width,height){
        super()
        if (treemap.instance) {
            return treemap.instance
        }
        this.data = {
            name: "root",
            children: []
        }
        this.width = width
        this.height = height

        this.color = d3.scaleLinear()
        .domain([-100, 100])
        .range(["#00aa00", "#aa0000"]);

        this.zoom = d3.zoom()
        .scaleExtent([0.5, 8])
        .translateExtent([[0, 0], [this.width.value, this.height.value]])
        .on("zoom", (event) => {
            const { transform } = event
            this.group.attr("transform", event.transform);
            this.svg.selectAll("text")
            .attr("transform", `scale(${1 / transform.k})`)
        });

        this.svg = d3.select(ref.value)
        .append("svg")
        .attr("width", this.width.value)
        .attr("height", this.height.value);
        
        this.renderD3();

        treemap.instance = this
    }

    renderD3(){
        this.svg.selectAll("*").remove();

        this.group = this.svg.append("g");
        this.svg.call(this.zoom);

        const root = d3.hierarchy(this.data)
            .sum(d => d.amount)
            .sort((a, b) => b.amount - a.amount);

        d3.treemap().size([this.width.value, this.height.value])
            .paddingInner(0)(root);
    
        const leaves = root.leaves();
    
        const nodes = this.group.selectAll("g")
            .data(leaves, d => d.data.name); // 设置 key
    
        // --- EXIT ---
        nodes.exit()
            .transition().duration(500)
            .style("opacity", 0)
            .remove();
    
        // --- ENTER ---
        const enter = nodes.enter()
            .append("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);
    
        enter.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => this.color(d.data.pct_chg))
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .on('click', (event, d) => {
                const _e = new CustomEvent('click', {
                    detail: {
                        message: 'click',
                        name: d.data.name
                    }
                })
                this.dispatchEvent( _e)
                // 可以做：下钻、放大、弹窗、发请求等操作
            })
            .style("opacity", 0)
            .transition().duration(500)
            .style("opacity", 1);
    
        enter.append("text")
            .attr("x", 4)
            .attr("y", 14)
            .attr('font-size', 12)
            .text(d => d.data.name);
        enter.append("text")
            .attr("x", 4)
            .attr("y", 28)
            .attr('font-size', 10)
            .text(d => `${d.data.pct_chg}%`);
        
        enter.on('mouseover', function (event, d) {
            d3.select(this).selectAll('text')
            .style('fill', 'white')
            .style('opacity',.7)
            d3.select(this).style('cursor','pointer')
        })
        .on('mouseout', function (event, d) {
            d3.select(this).selectAll('text')
            .style('fill', 'black')
        })
    
        // --- UPDATE ---
        nodes.transition().duration(500)
            .attr("transform", d => `translate(${d.x0},${d.y0})`);
    
        nodes.select("rect").transition().duration(500)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0);
    
        nodes.select("text").text(d => d.data.name);
    }

    push(children){
        this.data.children.push(children)
    }

    replace(children, isstock){
        this.svg.transition().call(this.zoom.transform, d3.zoomIdentity)
        const range = isstock ? [-10,10] : [Math.min(...children.map(item=>item.pct_chg)), Math.max(...children.map(item=>item.pct_chg))]
        const n = Math.max(...range.map(item=>Math.abs(item)))
        this.color = d3.scaleLinear()
        .domain([-n,n])
        .range(["#00aa00", "#aa0000"]);
        this.data.children = children
        this.renderD3()
    }

    clear(){
        this.data.children = []
        this.renderD3()
    }
}

export default function(ref, w, h){
    return new treemap(ref,w,h)
}
